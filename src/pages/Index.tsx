import { useState, useEffect } from 'react';
import { usePokemonList, useSearchPokemon } from '@/hooks/usePokemon';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSearch } from '@/components/PokemonSearch';
import { Button } from '@/components/ui/button';
import { Loader2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(true);
  const { toast } = useToast();

  const { 
    data: pokemonList, 
    isLoading: isLoadingList, 
    error: listError 
  } = usePokemonList(151, 0);

  const { 
    data: searchResult, 
    isLoading: isSearching, 
    error: searchError 
  } = useSearchPokemon(searchTerm);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setShowAll(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowAll(true);
  };

  const pokemonToShow = showAll ? pokemonList : (searchResult ? [searchResult] : []);
  const hasError = listError || searchError;

  // Handle errors with useEffect to prevent infinite re-renders
  useEffect(() => {
    if (hasError) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os Pokémon. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [hasError, toast]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-pokeball rounded-full flex items-center justify-center shadow-glow">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              Pokédex
            </h1>
          </div>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Descubra e explore todos os Pokémon da região de Kanto com sprites oficiais da PokéAPI
          </p>
          
          <div className="flex justify-center mb-6">
            <PokemonSearch 
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isSearching={isSearching}
            />
          </div>

          {!showAll && (
            <Button
              onClick={handleClearSearch}
              variant="secondary"
              className="mb-4"
            >
              Mostrar Todos os Pokémon
            </Button>
          )}
        </header>

        {/* Loading State */}
        {(isLoadingList || isSearching) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="ml-2 text-white">
              {isSearching ? 'Procurando...' : 'Carregando Pokémon...'}
            </span>
          </div>
        )}

        {/* Error State */}
        {searchError && !isSearching && (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">
              Pokémon não encontrado. Tente outro nome ou número.
            </p>
          </div>
        )}

        {/* Pokemon Grid */}
        {pokemonToShow && pokemonToShow.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pokemonToShow.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingList && !isSearching && !pokemonToShow?.length && !hasError && (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">
              Nenhum Pokémon encontrado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;