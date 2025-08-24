import { act, renderHook } from '@testing-library/react-native';
import { useFavorites } from '../hooks/useFavorites';
import { favoritesService } from '../services/FavoritesService';

const favoriteEvent = {
  id: '1',
  eventUid: 'u1',
  title: 'Test Event',
  start: new Date(),
  end: new Date(Date.now() + 60 * 60 * 1000),
  type: 'Party',
  typeAbbr: 'prty',
  locLabel: 'Camp',
};

const mockGetFavorites = jest.fn().mockResolvedValue([]);

jest.mock('../services/FavoritesService', () => ({
  favoritesService: {
    getFavorites: mockGetFavorites,
    addFavorite: jest.fn().mockResolvedValue(undefined),
    removeFavorite: jest.fn().mockResolvedValue(undefined),
    toggleFavorite: jest.fn().mockResolvedValue(true),
    clearAllFavorites: jest.fn().mockResolvedValue(undefined),
    getFavoritesCount: jest.fn().mockResolvedValue(0),
    exportFavorites: jest.fn().mockResolvedValue(''),
  },
}));

describe('useFavorites', () => {
  beforeEach(() => {
    mockGetFavorites.mockResolvedValue([]);
  });

  it('loads favorites on mount', async () => {
    const { result } = renderHook(() => useFavorites());
    await act(async () => {}); // wait for useEffect
    expect(result.current.favorites).toHaveLength(0);
    expect(favoritesService.getFavorites).toHaveBeenCalled();
  });

  it('adds a favorite and refreshes state', async () => {
    mockGetFavorites
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([favoriteEvent]);

    const { result } = renderHook(() => useFavorites());
    await act(async () => {}); // initial load

    await act(async () => {
      await result.current.addFavorite(favoriteEvent);
    });

    expect(favoritesService.addFavorite).toHaveBeenCalledWith(favoriteEvent);
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.count).toBe(1);
    expect(result.current.isFavorite('1')).toBe(true);
  });
});
