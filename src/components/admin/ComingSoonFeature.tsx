
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ComingSoonFeatureProps {
  title: string;
  description: string;
}

const ComingSoonFeature = ({ title, description }: ComingSoonFeatureProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <AlertTriangle className="h-10 w-10 mb-4 text-amber-500" />
          <h3 className="text-lg font-medium">{title} não disponível</h3>
          <p className="mt-2 max-w-md">
            {description} será implementado em uma versão futura.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComingSoonFeature;
