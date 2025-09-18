import { Pokemon } from '@/hooks/usePokemon';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-pokemon-red',
  water: 'bg-pokemon-blue',
  electric: 'bg-pokemon-yellow',
  grass: 'bg-pokemon-green',
  ice: 'bg-blue-300',
  fighting: 'bg-red-700',
  poison: 'bg-pokemon-purple',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-500',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

export const PokemonCard = ({ pokemon, onClick }: PokemonCardProps) => {
  const mainType = pokemon.types[0]?.type.name || 'normal';
  const spriteUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

  return (
    <Card className="group relative overflow-hidden bg-gradient-card backdrop-blur-sm border-0 shadow-card hover:shadow-pokemon transition-all duration-300 hover:scale-105 cursor-pointer" onClick={onClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 text-center">
        <div className="mb-2">
          <span className="text-sm font-mono text-muted-foreground">
            #{pokemon.id.toString().padStart(3, '0')}
          </span>
        </div>
        
        <div className="mb-4 relative">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <img
              src={spriteUrl}
              alt={pokemon.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>
        
        <h3 className="text-xl font-bold capitalize mb-3 text-card-foreground">
          {pokemon.name}
        </h3>
        
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {pokemon.types.map((type) => (
            <Badge
              key={type.type.name}
              variant="secondary"
              className={`${typeColors[type.type.name] || 'bg-gray-400'} text-white border-0 hover:scale-105 transition-transform capitalize`}
            >
              {type.type.name}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <div className="font-medium">Altura</div>
            <div>{(pokemon.height / 10).toFixed(1)}m</div>
          </div>
          <div>
            <div className="font-medium">Peso</div>
            <div>{(pokemon.weight / 10).toFixed(1)}kg</div>
          </div>
        </div>
      </div>
    </Card>
  );
};