import { useState, useEffect } from 'react';
import { useSearchPokemon, Pokemon } from '@/hooks/usePokemon';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSearch } from '@/components/PokemonSearch';
import { Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [capturedPokemon, setCapturedPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { 
    data: searchResult, 
    isLoading: isSearching, 
    error: searchError 
  } = useSearchPokemon(searchTerm);

  const handleCapture = (term: string) => {
    setSearchTerm(term);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  // Add pokemon to captured list when search succeeds
  useEffect(() => {
    if (searchResult && searchTerm) {
      const alreadyCaptured = capturedPokemon.some(p => p.id === searchResult.id);
      if (!alreadyCaptured) {
        setCapturedPokemon(prev => [...prev, searchResult]);
        toast({
          title: "Pokémon Capturado!",
          description: `${searchResult.name} foi adicionado à sua coleção!`,
        });
      } else {
        toast({
          title: "Pokémon já capturado",
          description: `${searchResult.name} já está na sua coleção.`,
          variant: "destructive",
        });
      }
      setSearchTerm(''); // Clear search after capture
    }
  }, [searchResult, searchTerm, capturedPokemon, toast]);

  // Handle search errors
  useEffect(() => {
    if (searchError && searchTerm) {
      toast({
        title: "Erro",
        description: "Pokémon não encontrado. Tente outro nome ou número.",
        variant: "destructive",
      });
      setSearchTerm('');
    }
  }, [searchError, searchTerm, toast]);

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
            Capture Pokémon buscando por nome ou número da PokéAPI
          </p>
          
          <div className="flex justify-center mb-6">
            <PokemonSearch 
              onCapture={handleCapture}
              onClear={handleClear}
              isSearching={isSearching}
            />
          </div>
        </header>

        {/* Pokemon Grid */}
        {capturedPokemon.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {capturedPokemon.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">
              Sua coleção está vazia. Use a barra de pesquisa para capturar seus primeiros Pokémon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;