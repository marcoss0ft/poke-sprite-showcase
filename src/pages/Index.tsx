import { useState, useEffect } from 'react';
import { useSearchPokemon, Pokemon } from '@/hooks/usePokemon';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSearch } from '@/components/PokemonSearch';
import { Target, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [capturedPokemon, setCapturedPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
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
              <PokemonCard 
                key={pokemon.id} 
                pokemon={pokemon} 
                onClick={() => setSelectedPokemon(pokemon)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">
              Sua coleção está vazia. Use a barra de pesquisa para capturar seus primeiros Pokémon!
            </p>
          </div>
        )}

        {/* Pokemon Detail Modal */}
        {selectedPokemon && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPokemon(null)}>
            <Card className="max-w-md w-full bg-gradient-card backdrop-blur-sm border-0 shadow-pokemon" onClick={(e) => e.stopPropagation()}>
              <div className="relative p-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedPokemon(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <div className="mb-4">
                    <span className="text-lg font-mono text-muted-foreground">
                      #{selectedPokemon.id.toString().padStart(3, '0')}
                    </span>
                  </div>
                  
                  <div className="w-48 h-48 mx-auto mb-6">
                    <img
                      src={selectedPokemon.sprites.front_default}
                      alt={selectedPokemon.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <h2 className="text-3xl font-bold capitalize mb-4 text-card-foreground">
                    {selectedPokemon.name}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {selectedPokemon.types.map((type) => (
                      <Badge
                        key={type.type.name}
                        variant="secondary"
                        className="bg-pokemon-red text-white border-0 capitalize px-3 py-1"
                      >
                        {type.type.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 text-card-foreground mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(selectedPokemon.height / 10).toFixed(1)}m</div>
                      <div className="text-muted-foreground">Altura</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(selectedPokemon.weight / 10).toFixed(1)}kg</div>
                      <div className="text-muted-foreground">Peso</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-card-foreground">Stats</h3>
                    {selectedPokemon.stats.map((stat) => (
                      <div key={stat.stat.name} className="flex items-center justify-between">
                        <span className="text-muted-foreground capitalize">
                          {stat.stat.name.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{stat.base_stat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;