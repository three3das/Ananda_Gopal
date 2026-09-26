import { useReducer, useCallback, useMemo } from 'react';
import { type GameType, type Word } from '@shared/schema';

interface GameState {
  currentWordIndex: number;
  correctAnswers: number;
  showCelebration: boolean;
  gameCompleted: boolean;
  selectedPicture: Word | null;
  gameType: GameType;
  currentMixType: string;
  isLoading: boolean;
  error: string | null;
}

type GameAction =
  | { type: 'SET_CURRENT_WORD_INDEX'; payload: number }
  | { type: 'INCREMENT_CORRECT_ANSWERS' }
  | { type: 'SET_SHOW_CELEBRATION'; payload: boolean }
  | { type: 'SET_GAME_COMPLETED'; payload: boolean }
  | { type: 'SET_SELECTED_PICTURE'; payload: Word | null }
  | { type: 'SET_GAME_TYPE'; payload: GameType }
  | { type: 'SET_CURRENT_MIX_TYPE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' }
  | { type: 'HANDLE_CORRECT_ANSWER' }
  | { type: 'HANDLE_INCORRECT_ANSWER'; payload: Word | null };

const initialState: GameState = {
  currentWordIndex: 0,
  correctAnswers: 0,
  showCelebration: false,
  gameCompleted: false,
  selectedPicture: null,
  gameType: 'picture-match',
  currentMixType: '',
  isLoading: false,
  error: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CURRENT_WORD_INDEX':
      return { ...state, currentWordIndex: action.payload };
    case 'INCREMENT_CORRECT_ANSWERS':
      return { ...state, correctAnswers: state.correctAnswers + 1 };
    case 'SET_SHOW_CELEBRATION':
      return { ...state, showCelebration: action.payload };
    case 'SET_GAME_COMPLETED':
      return { ...state, gameCompleted: action.payload };
    case 'SET_SELECTED_PICTURE':
      return { ...state, selectedPicture: action.payload };
    case 'SET_GAME_TYPE':
      return { 
        ...state, 
        gameType: action.payload, 
        currentWordIndex: 0, 
        selectedPicture: null,
        showCelebration: false 
      };
    case 'SET_CURRENT_MIX_TYPE':
      return { ...state, currentMixType: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'HANDLE_CORRECT_ANSWER':
      return {
        ...state,
        correctAnswers: state.correctAnswers + 1,
        showCelebration: true,
        selectedPicture: state.selectedPicture || { 
          id: 'correct', 
          word: 'correct', 
          image: '', 
          audio: '' 
        } as Word
      };
    case 'HANDLE_INCORRECT_ANSWER':
      return { ...state, selectedPicture: action.payload };
    case 'RESET_GAME':
      return { ...initialState, gameType: state.gameType };
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = useMemo(() => ({
    setCurrentWordIndex: (index: number) => 
      dispatch({ type: 'SET_CURRENT_WORD_INDEX', payload: index }),
    
    incrementCorrectAnswers: () => 
      dispatch({ type: 'INCREMENT_CORRECT_ANSWERS' }),
    
    setShowCelebration: (show: boolean) => 
      dispatch({ type: 'SET_SHOW_CELEBRATION', payload: show }),
    
    setGameCompleted: (completed: boolean) => 
      dispatch({ type: 'SET_GAME_COMPLETED', payload: completed }),
    
    setSelectedPicture: (picture: Word | null) => 
      dispatch({ type: 'SET_SELECTED_PICTURE', payload: picture }),
    
    setGameType: (gameType: GameType) => 
      dispatch({ type: 'SET_GAME_TYPE', payload: gameType }),
    
    setCurrentMixType: (mixType: string) => 
      dispatch({ type: 'SET_CURRENT_MIX_TYPE', payload: mixType }),
    
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    
    setError: (error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    
    handleCorrectAnswer: () => dispatch({ type: 'HANDLE_CORRECT_ANSWER' }),
    
    handleIncorrectAnswer: (picture: Word | null = null) => 
      dispatch({ type: 'HANDLE_INCORRECT_ANSWER', payload: picture }),
  }), []);

  const canSelectAnswer = useCallback(() => {
    return !state.selectedPicture && !state.showCelebration && !state.isLoading;
  }, [state.selectedPicture, state.showCelebration, state.isLoading]);

  const nextWord = useCallback(() => {
    actions.setCurrentWordIndex(state.currentWordIndex + 1);
    actions.setSelectedPicture(null);
    actions.setShowCelebration(false);
  }, [state.currentWordIndex, actions]);

  return {
    state,
    actions,
    canSelectAnswer,
    nextWord,
  };
}