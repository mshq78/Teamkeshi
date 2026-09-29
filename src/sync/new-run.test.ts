import { describe, it, expect } from 'vitest';
import { applyJudgeOps, mergeOperatorState, redactForJudge } from './merge';
import { appReducer } from '../store/reducer';
import { buildRunArchive } from '../scoring/archive';
import { AppState, INITIAL_SETTINGS, INITIAL_SCORING } from '../store/state';
import { ScoreEntry } from '../types';

function base(): AppState {
  return {
    schemaVersion: 4,
    participants: [],
    teams: ['a', 'b'].map((id) => ({ id, name: id, color: '', badgeBg: '', borderColor: '', textColor: '', memberIds: [] })),
    draftLog: [],
    settings: INITIAL_SETTINGS,
    runs: [],
    scoring: {
      ...INITIAL_SCORING,
      runId: 'run-1',
      events: [{ id: 'e1', name: 'ناهار', weight: 1, order: 1, status: 'active', indicators: [{ id: 'i1', name: 'طعم', maxScore: 10, weight: 1, order: 1 }] }],
      judges: [{ id: 'j1', name: 'الف', accessCode: '1111', eventIds: [] }],
    },
  };
}

const entry = (value: number, updatedAt: string): ScoreEntry => ({ judgeId: 'j1', teamId: 'a', eventId: 'e1', indicatorId: 'i1', value, updatedAt });

function startNewRun(state: AppState): AppState {
  const nowIso = '2026-01-01T12:00:00Z';
  return appReducer(state, {
    type: 'START_NEW_RUN',
    payload: { newRunId: 'run-2', newRunName: 'دور دوم', nowIso, archive: buildRunArchive(state, nowIso), clearParticipants: false },
  });
}

describe('starting a new run with sync', () => {
  const old = () => applyJudgeOps(base(), 'j1', [{ kind: 'score', entry: entry(9, '2026-01-01T10:00:00Z') }]);

  it('the reset survives the merge: old scores do not come back from the server', () => {
    const server = old();
    const operator = startNewRun(server);
    const merged = mergeOperatorState(server, operator);
    expect(merged.scoring.runId).toBe('run-2');
    expect(Object.keys(merged.scoring.scores)).toHaveLength(0);
  });

  it('a judge phone still holding old-run scores cannot push them into the new run', () => {
    const server = mergeOperatorState(old(), startNewRun(old()));
    const late = applyJudgeOps(server, 'j1', [{ kind: 'score', entry: { ...entry(9, '2026-01-01T10:00:00Z'), runId: 'run-1' } as ScoreEntry }]);
    expect(Object.keys(late.scoring.scores)).toHaveLength(0);
  });

  it('keeps the archive on the server and hides it from judges', () => {
    const server = mergeOperatorState(old(), startNewRun(old()));
    expect(server.runs).toHaveLength(1);
    expect(redactForJudge(server, 'j1').runs ?? []).toHaveLength(0);
  });

  it('an operator that was not in the new run cannot bring the archive back after it was deleted', () => {
    let server = mergeOperatorState(old(), startNewRun(old()));
    const withoutRun = appReducer(server, { type: 'DELETE_RUN_ARCHIVE', payload: { runId: server.runs![0].id } });
    server = mergeOperatorState(server, withoutRun);
    expect(server.runs).toHaveLength(0);
  });
});
