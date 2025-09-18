import { useQuery } from '@tanstack/react-query';

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

const fetchPokemon = async (id: number): Promise<Pokemon> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!response.ok) {
    throw new Error('Pokemon not found');
  }
  return response.json();
};

const fetchPokemonList = async (limit: number = 151, offset: number = 0) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pokemon list');
  }
  const data = await response.json();
  
  // Fetch details for each pokemon
  const pokemonDetails = await Promise.all(
    data.results.map(async (pokemon: any, index: number) => {
      const id = offset + index + 1;
      return fetchPokemon(id);
    })
  );
  
  return pokemonDetails;
};

export const usePokemon = (id: number) => {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => fetchPokemon(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePokemonList = (limit: number = 151, offset: number = 0) => {
  return useQuery({
    queryKey: ['pokemon-list', limit, offset],
    queryFn: () => fetchPokemonList(limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSearchPokemon = (searchTerm: string) => {
  return useQuery({
    queryKey: ['pokemon-search', searchTerm],
    queryFn: async () => {
      const isNumeric = /^\d+$/.test(searchTerm);
      if (isNumeric) {
        return fetchPokemon(parseInt(searchTerm));
      } else {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
        if (!response.ok) {
          throw new Error('Pokemon not found');
        }
        return response.json();
      }
    },
    enabled: searchTerm.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};