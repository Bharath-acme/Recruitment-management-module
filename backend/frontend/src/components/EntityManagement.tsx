import React, { useState, useEffect, useCallback } from 'react';
import { 
  getSkills, createSkill, 
  getDepartments, createDepartment, 
  getLocations, createLocation, Entity, EntityCreate
} from './entity';
import { Briefcase, MapPin, Lightbulb, Plus, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';

// Helper component for repeated logic
interface EntitySectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  fetchFunction: () => Promise<Entity[]>;
  createFunction: (data: EntityCreate) => Promise<Entity>;
  placeholder: string;
  colorClass: string;
}

const EntitySection: React.FC<EntitySectionProps> = ({ 
  title, 
  description,
  icon,
  fetchFunction, 
  createFunction,
  placeholder,
  colorClass
}) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [newEntityName, setNewEntityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFunction();
      setEntities(data);
    } catch (err) {
      setError(`Error fetching ${title.toLowerCase()}.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, title]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const newEntity = await createFunction({ name: newEntityName.trim() });
      setEntities(prev => [...prev, newEntity]);
      setNewEntityName('');
      toast.success(`${newEntity.name} created successfully!`, {
        description: `Added to ${title.toLowerCase()}`,
      });
    } catch (err) {
      const errorMessage = (err as Error).message || `Failed to create ${title.toLowerCase()}.`;
      setError(errorMessage);
      toast.error('Failed to create', {
        description: errorMessage,
      });
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className={`${colorClass} text-white`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="text-white/80">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleCreate} className="flex gap-2 mb-4">
          <Input
            type="text"
            value={newEntityName}
            onChange={(e) => setNewEntityName(e.target.value)}
            placeholder={`Add new ${placeholder}`}
            disabled={creating}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={creating} className="gap-2">
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading && entities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : entities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No {title.toLowerCase()} yet. Add your first one above!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Total: {entities.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {entities.map(entity => (
                <Badge 
                  key={entity.id} 
                  variant="secondary"
                  className="px-3 py-1.5 hover:bg-secondary/80 transition-colors"
                >
                  {entity.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EntityManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Entity Management
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Manage your organization's skills, departments, and locations all in one place.
            Create new entries and track everything efficiently.
          </p>
        </div>

        {/* Entity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EntitySection
            title="Skills"
            description="Technical & soft skills"
            icon={<Lightbulb className="h-6 w-6 text-white" />}
            fetchFunction={getSkills}
            createFunction={createSkill}
            placeholder="skill"
            colorClass="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          
          <EntitySection
            title="Departments"
            description="Organizational units"
            icon={<Briefcase className="h-6 w-6 text-white" />}
            fetchFunction={getDepartments}
            createFunction={createDepartment}
            placeholder="department"
            colorClass="bg-gradient-to-br from-blue-500 to-cyan-600"
          />

          <EntitySection
            title="Locations"
            description="Office locations"
            icon={<MapPin className="h-6 w-6 text-white" />}
            fetchFunction={getLocations}
            createFunction={createLocation}
            placeholder="location"
            colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Pro tip:</strong> Keep your entities organized and up-to-date for better resource management and reporting.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EntityManagementPage;