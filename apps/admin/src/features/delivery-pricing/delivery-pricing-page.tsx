import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@fishmarket/ui';
import { PageHeader } from '../../components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { deliveryPricingService } from '../../services/delivery-pricing.service';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

interface Governorate {
  id: string;
  slug: string;
  name: string;
}

interface Area {
  id: string;
  slug: string;
  name: string;
}

export function DeliveryPricingPage() {
  const queryClient = useQueryClient();

  // ——— data loading ———
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});
  const [areaGovMap, setAreaGovMap] = useState<Record<string, string>>({});
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/locations/governorates`)
      .then((r) => r.json())
      .then((res) => {
        const govs: Governorate[] = res.data || res;
        setGovernorates(govs);
        return govs;
      })
      .then((govs) => {
        const nameMap: Record<string, string> = {};
        const govMap: Record<string, string> = {};
        return Promise.all(
          govs.map((g) =>
            fetch(`${API_BASE}/api/v1/locations/areas/${g.slug}`)
              .then((r) => r.json())
              .then((res) => {
                const areas: Area[] = res.data || res;
                areas.forEach((a) => {
                  nameMap[a.id] = a.name;
                  govMap[a.id] = g.id;
                });
              }),
          ),
        ).then(() => {
          setAreaMap(nameMap);
          setAreaGovMap(govMap);
          setPageReady(true);
        });
      })
      .catch(() => setPageReady(true));
  }, []);

  // ——— form state ———
  const [showForm, setShowForm] = useState(false);
  const [formGovId, setFormGovId] = useState('');
  const [formAreas, setFormAreas] = useState<Area[]>([]);
  const [fromAreaId, setFromAreaId] = useState('');
  const [toAreaId, setToAreaId] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!formGovId) {
      setFormAreas([]);
      return;
    }
    const gov = governorates.find((g) => g.id === formGovId);
    if (!gov) return;
    fetch(`${API_BASE}/api/v1/locations/areas/${gov.slug}`)
      .then((r) => r.json())
      .then((res) => setFormAreas(res.data || res))
      .catch(() => {});
  }, [formGovId, governorates]);

  // ——— filter state ———
  const [filterGovId, setFilterGovId] = useState('');
  const [filterFromAreaId, setFilterFromAreaId] = useState('');
  const [filterToAreaId, setFilterToAreaId] = useState('');

  /** Only areas belonging to the selected governorate (or all if none selected). */
  const filterAreaOptions = useMemo(() => {
    const entries = Object.entries(areaMap);
    if (!filterGovId) return entries.map(([id, name]) => ({ id, name }));
    return entries
      .filter(([id]) => areaGovMap[id] === filterGovId)
      .map(([id, name]) => ({ id, name }));
  }, [areaMap, areaGovMap, filterGovId]);

  // ——— data query ———
  const { data: pricings = [], isLoading } = useQuery({
    queryKey: ['delivery-pricing'],
    queryFn: deliveryPricingService.findAll,
  });

  // ——— mutations ———
  const createMutation = useMutation({
    mutationFn: deliveryPricingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-pricing'] });
      setShowForm(false);
      setFormGovId('');
      setFromAreaId('');
      setToAreaId('');
      setPrice('');
      toast.success('Prix de livraison ajouté');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deliveryPricingService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-pricing'] });
      toast.success('Prix de livraison supprimé');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAreaId || !toAreaId || !price) return;
    createMutation.mutate({ fromAreaId, toAreaId, price: Number(price) });
  };

  const resetForm = () => {
    setShowForm(false);
    setFormGovId('');
    setFromAreaId('');
    setToAreaId('');
    setPrice('');
  };

  // ——— filtered pricings ———
  const displayed = useMemo(() => {
    return pricings.filter((p) => {
      if (filterFromAreaId && p.fromAreaId !== filterFromAreaId) return false;
      if (filterToAreaId && p.toAreaId !== filterToAreaId) return false;
      if (filterGovId) {
        if (areaGovMap[p.fromAreaId] !== filterGovId && areaGovMap[p.toAreaId] !== filterGovId)
          return false;
      }
      return true;
    });
  }, [pricings, filterFromAreaId, filterToAreaId, filterGovId, areaGovMap]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prix de livraison"
        description="Définir les prix de livraison entre les zones"
      >
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </PageHeader>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nouveau prix de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!pageReady ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </div>
              ) : (
                <>
                  <div className="w-full md:w-72">
                    <label className="text-sm font-medium">Gouvernorat *</label>
                    <select
                      value={formGovId}
                      onChange={(e) => {
                        setFormGovId(e.target.value);
                        setFromAreaId('');
                        setToAreaId('');
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Choisir le gouvernorat</option>
                      {governorates.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formGovId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">De (zone de départ) *</label>
                        <select
                          value={fromAreaId}
                          onChange={(e) => setFromAreaId(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Choisir la délégation</option>
                          {formAreas.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Vers (zone d'arrivée) *</label>
                        <select
                          value={toAreaId}
                          onChange={(e) => setToAreaId(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Choisir la délégation</option>
                          {formAreas.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="w-full md:w-48">
                    <label className="text-sm font-medium">Prix (TND) *</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="10.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || !fromAreaId || !toAreaId || !price}
                    >
                      {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* ——— filters + table ——— */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste des prix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pageReady && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Gouvernorat</label>
                <select
                  value={filterGovId}
                  onChange={(e) => {
                    setFilterGovId(e.target.value);
                    setFilterFromAreaId('');
                    setFilterToAreaId('');
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Tous</option>
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Zone de départ</label>
                <select
                  value={filterFromAreaId}
                  onChange={(e) => setFilterFromAreaId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Toutes</option>
                  {filterAreaOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Zone d'arrivée</label>
                <select
                  value={filterToAreaId}
                  onChange={(e) => setFilterToAreaId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Toutes</option>
                  {filterAreaOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Aucun prix de livraison défini
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                  <th className="px-4 py-3">De</th>
                  <th className="px-4 py-3">Vers</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {displayed.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-sm">{areaMap[p.fromAreaId] ?? p.fromAreaId}</td>
                    <td className="px-4 py-3 text-sm">{areaMap[p.toAreaId] ?? p.toAreaId}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {Number(p.price).toFixed(2)} TND
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(p.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
