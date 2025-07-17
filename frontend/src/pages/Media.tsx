import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { BaseLayout } from '../components/BaseLayout';

// Mock data for drone events
const eventImages = [
  {
    name: 'Drone Expo 2023',
    description: 'Showcasing the latest in drone technology.',
    imageUrl: '/media/drone-expo-2023.jpg',
  },
  {
    name: 'Aerial Display Day',
    description: 'Live drone flight demonstrations and stunts.',
    imageUrl: '/media/aerial-display-day.jpg',
  },
  {
    name: 'Tech Conference',
    description: 'Panel discussions and drone showcases.',
    imageUrl: '/media/tech-conference.jpg',
  },
  {
    name: 'Rescue Operations Demo',
    description: 'Drones in action for emergency response.',
    imageUrl: '/media/rescue-demo.jpg',
  },
];

const Media: React.FC = () => {
  return (
    <BaseLayout className="p-6">
      <h1 className="text-3xl font-bold mb-6">Media Gallery</h1>
      <p className="text-muted-foreground mb-8">Images from various drone-related events, expos, and displays.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {eventImages.map((event, idx) => (
          <Card key={idx} className="overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </BaseLayout>
  );
};

export default Media; 