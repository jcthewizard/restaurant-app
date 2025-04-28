import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Offer, Lobby } from '../../types';

interface QRCodeGeneratorProps {
  offer: Offer;
  lobby?: Lobby;
  userId: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ offer, lobby, userId }) => {
  // Generate QR code data
  const generateQRData = () => {
    const data = {
      type: lobby ? 'group' : 'individual',
      offerId: offer.id,
      restaurantId: offer.restaurantId,
      discountPercent: offer.discountPercent,
      userId,
      timestamp: new Date().toISOString(),
    };
    
    // Add lobby data if this is a group redemption
    if (lobby) {
      Object.assign(data, {
        lobbyId: lobby.id,
        participantIds: lobby.participants.map(p => p.userId),
        participantCount: lobby.participants.length,
      });
    }
    
    return JSON.stringify(data);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h3 className="text-lg font-bold mb-2">
        {lobby ? 'Group Discount QR Code' : 'Your Discount QR Code'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Show this to the restaurant to redeem your {offer.discountPercent}% discount
        {lobby ? ` for your group of ${lobby.participants.length}` : ''}
      </p>
      
      <div className="flex justify-center mb-4">
        <QRCodeSVG
          value={generateQRData()}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={false}
        />
      </div>
      
      <div className="text-center">
        <h4 className="font-bold">{offer.restaurant.name}</h4>
        <p className="text-sm text-gray-600">{offer.restaurant.address}</p>
        <p className="text-red-600 font-bold mt-2">
          {offer.discountPercent}% OFF
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Valid until {new Date(offer.validTo).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;