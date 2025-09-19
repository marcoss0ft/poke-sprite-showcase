import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pokemon } from './usePokemon';

type CaptureResponse = {
  status: 'captured' | 'already_captured';
  pokemon: Pokemon;
  captured_at?: string;
};

type ReleaseResponse = {
  status: 'released';
  pokemon: Pokemon;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const fetchCapturedPokemon = async (): Promise<Pokemon[]> => {
  const response = await fetch(`${API_BASE_URL}/api/captured`);

  if (!response.ok) {
    throw new Error('Falha ao buscar Pokémon capturados.');
  }

  return response.json();
};

const capturePokemonOnServer = async (pokemon: Pokemon): Promise<CaptureResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/captured`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pokemon),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
    throw new Error(errorBody.message ?? 'Falha ao capturar Pokémon.');
  }

  return response.json();
};

const releasePokemonOnServer = async (pokemonId: number): Promise<ReleaseResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/captured/${pokemonId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
    throw new Error(errorBody.message ?? 'Falha ao liberar Pokémon.');
  }

  return response.json();
};

export const useCapturedPokemon = () =>
  useQuery({
    queryKey: ['captured-pokemon'],
    queryFn: fetchCapturedPokemon,
    staleTime: 1000 * 60 * 5,
  });

export const useCapturePokemon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: capturePokemonOnServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captured-pokemon'] });
    },
  });
};

export const useReleasePokemon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releasePokemonOnServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captured-pokemon'] });
    },
  });
};
