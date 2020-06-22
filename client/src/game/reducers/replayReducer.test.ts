import loadGameJSON from '../../../test/loadGameJSON';
import { // Direct import instead of namespace import for compactness
  hypoStart,
  startReplay,
  hypoAction,
  clue,
  turn,
  hypoBack,
  hypoEnd,
} from '../../../test/testActions';
import testGame from '../../../test_data/test_game.json';
import ClueType from '../types/ClueType';
import State from '../types/State';
import replayReducer from './replayReducer';
import stateReducer from './stateReducer';

let testState: State;

// Initialize the state before each test
beforeEach(() => {
  // Load the game and start a replay
  testState = loadGameJSON(testGame);
  testState = stateReducer(testState, startReplay());
});

describe('replayReducer', () => {
  describe('hypothetical', () => {
    test('can start', () => {
      const state = replayReducer(testState.replay, hypoStart());
      expect(state.ongoingHypothetical).toBe(testState.replay.states[testState.replay.turn]);
      expect(state.hypotheticalStates.length).toBe(1);
      expect(state.hypotheticalStates[0]).toBe(state.ongoingHypothetical);
    });

    test('can give a clue', () => {
      let state = replayReducer(testState.replay, hypoStart());

      // Give a number 3 clue in the new hypothetical
      const hypoClue = hypoAction(clue(ClueType.Rank, 3, 0, [], 1, 0));
      state = replayReducer(state, hypoClue);

      // End the turn
      state = replayReducer(state, hypoAction(turn(1, 1)));

      // Using "?" is better than "!" since it will fail with a a slightly better error message
      const expectedClues = testState.replay.states[testState.replay.turn].clueTokens - 1;
      expect(state.ongoingHypothetical?.clueTokens).toBe(expectedClues);
    });

    test('can go back on a hypothetical after giving a clue', () => {
      let state = replayReducer(testState.replay, hypoStart());
      const hypoClue = hypoAction(clue(ClueType.Rank, 3, 0, [], 1, 0));
      state = replayReducer(state, hypoClue);
      state = replayReducer(state, hypoAction(turn(1, 1)));
      state = replayReducer(state, hypoBack());

      const originalState = testState.visibleState;
      expect(state.ongoingHypothetical).toBe(originalState);
    });

    test('can end hypothetical after giving a clue', () => {
      let state = replayReducer(testState.replay, hypoStart());
      const hypoClue = hypoAction(clue(ClueType.Rank, 3, 0, [], 1, 0));
      state = replayReducer(state, hypoClue);
      state = replayReducer(state, hypoAction(turn(1, 1)));
      state = replayReducer(state, hypoEnd());
      expect(state.ongoingHypothetical).toBeNull();
    });
  });
});