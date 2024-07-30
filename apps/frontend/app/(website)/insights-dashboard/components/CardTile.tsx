import { CardTileProps } from '../types';

export const CardTile: React.FC<CardTileProps> = ({ title, value, change, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{ title }</h3>
      <div className="text-3xl font-bold mb-2">{ value }</div>
      <div className={ `text-sm ${ change.isPositive ? 'text-green-600' : 'text-red-600' } mb-1` }>
        { change.isPositive ? '+' : '-' }{ Math.abs(change.value) }%
      </div>
      { subtitle && <div className="text-sm text-gray-500">{ subtitle }</div> }
    </div>
  );
};