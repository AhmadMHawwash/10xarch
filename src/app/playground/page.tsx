import { type Metadata } from 'next';
import PlaygroundClient from './client';

export const metadata: Metadata = {
  title: '10×arch Playground - Design Your Systems',
  description: 'Design, visualize, and document your system architecture with our intuitive drag-and-drop interface.'
};

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}

export const revalidate = 86400;
