import { useEffect, useMemo, useState } from 'react';
import { useSearchPokemon, Pokemon } from '@/hooks/usePokemon';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSearch } from '@/components/PokemonSearch';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCapturedPokemon, useCapturePokemon, useReleasePokemon } from '@/hooks/useCapturedPokemon';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const { toast } = useToast();

  const {
    data: searchResult,
    isLoading: isSearching,
    error: searchError,
  } = useSearchPokemon(searchTerm);

  const {
    data: capturedPokemon = [],
    isLoading: isCapturedLoading,
    isError: capturedError,
  } = useCapturedPokemon();

  const { mutateAsync: capturePokemon, isPending: isCapturing } = useCapturePokemon();
  const { mutateAsync: releasePokemon, isPending: isReleasing } = useReleasePokemon();

  useEffect(() => {
    if (!searchResult || !searchTerm) {
      return;
    }

    let isCurrent = true;

    const persistCapturedPokemon = async () => {
      try {
        const response = await capturePokemon(searchResult);

        if (!isCurrent) {
          return;
        }

        if (response.status === 'captured') {
          toast({
            title: 'Pokémon Capturado!',
            description: `${searchResult.name} foi adicionado à sua coleção!`,
          });
        } else {
          toast({
            title: 'Pokémon já capturado',
            description: `${searchResult.name} já está na sua coleção.`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Falha ao capturar Pokémon.';
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive',
        });
      } finally {
        if (isCurrent) {
          setSearchTerm('');
        }
      }
    };

    void persistCapturedPokemon();

    return () => {
      isCurrent = false;
    };
  }, [capturePokemon, searchResult, searchTerm, toast]);

  useEffect(() => {
    if (searchError && searchTerm) {
      toast({
        title: 'Erro',
        description: 'Pokémon não encontrado. Tente outro nome ou número.',
        variant: 'destructive',
      });
      setSearchTerm('');
    }
  }, [searchError, searchTerm, toast]);

  const handleCapture = (term: string) => {
    setSearchTerm(term);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  const confirmRelease = async () => {
    if (!selectedPokemon) {
      return;
    }

    try {
      await releasePokemon(selectedPokemon.id);
      toast({
        title: 'Pokémon liberado',
        description: `${selectedPokemon.name} voltou para a natureza.`,
      });
      setSelectedPokemon(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao liberar Pokémon.';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const isBusy = useMemo(() => isSearching || isCapturing, [isCapturing, isSearching]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/img/pokeball.png"
              alt="Pokébola"
              className="w-14 h-14 drop-shadow-lg"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">Pokédex</h1>
          </div>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Capture Pokémon buscando por nome ou número da PokéAPI
          </p>

          <div className="flex justify-center mb-6">
            <PokemonSearch onCapture={handleCapture} onClear={handleClear} isSearching={isBusy} />
          </div>
        </header>

        {isCapturedLoading ? (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">Carregando sua coleção...</p>
          </div>
        ) : capturedError ? (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">
              Não foi possível carregar a coleção no momento. Tente novamente mais tarde.
            </p>
          </div>
        ) : capturedPokemon.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {capturedPokemon.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} onClick={() => setSelectedPokemon(pokemon)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">
              Sua coleção está vazia. Use a barra de pesquisa para capturar seus primeiros Pokémon!
            </p>
          </div>
        )}

        {selectedPokemon && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPokemon(null)}
          >
            <Card
              className="max-w-md w-full max-h-[90vh] bg-gradient-card backdrop-blur-sm border-0 shadow-pokemon flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-6 flex-1 overflow-y-auto">
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
              <CardFooter className="justify-center border-t border-white/10 p-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" disabled={isReleasing} className="release-button">
                      {isReleasing ? 'Liberando...' : 'Liberar Pokémon'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza que deseja liberar este Pokémon?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação remove o Pokémon da sua coleção. Você poderá capturá-lo novamente no futuro.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isReleasing}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void confirmRelease()} disabled={isReleasing}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
