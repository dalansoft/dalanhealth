import { useState } from 'react';
import { Building2, MapPin, Star, Plus, Check, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AddBranchModal } from '@/components/layout/AddBranchModal';
import { useBranch, useCurrentBranch, type Branch } from '@/store/branch';
import { cn } from '@/lib/cn';

/**
 * Branches management page (CLINIC › Branches).
 *
 * Lists every branch on the clinic account, lets the admin switch / add /
 * delete, and shows the active branch with a check. Replaces the inline
 * "Add new branch" link that used to sit in the header dropdown.
 */
export function ClinicBranches() {
  const branches = useBranch((s) => s.branches);
  const switchBranch = useBranch((s) => s.switchBranch);
  const setBranches = useBranch((s) => s.setBranches);
  const current = useCurrentBranch();
  const [addOpen, setAddOpen] = useState(false);

  const handleDelete = (id: string) => {
    if (branches.length <= 1) return; // Always keep at least one branch.
    if (!confirm('Delete this branch? This cannot be undone.')) return;
    const remaining = branches.filter((b) => b.id !== id);
    setBranches(remaining);
    // If the deleted branch was active, switch to the first remaining one.
    if (current?.id === id) {
      switchBranch(remaining[0].id);
    }
  };

  const handleSetPrimary = (id: string) => {
    setBranches(branches.map((b) => ({ ...b, primary: b.id === id })));
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">Branches</div>
          <div className="text-xs text-muted">
            Manage every location of your clinic — staff, queue, wallet, and TV display run independently per branch.
          </div>
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
          Add branch
        </Button>
      </div>

      {/* Branch list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b) => (
          <BranchCard
            key={b.id}
            branch={b}
            active={b.id === current?.id}
            onActivate={() => switchBranch(b.id)}
            onDelete={() => handleDelete(b.id)}
            onMakePrimary={() => handleSetPrimary(b.id)}
            canDelete={branches.length > 1}
          />
        ))}
      </div>

      {branches.length === 0 && (
        <Card>
          <div className="py-10 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300 mb-3">
              <Building2 size={20} />
            </div>
            <div className="text-base font-semibold text-ink-900 dark:text-ink-50">No branches yet</div>
            <div className="mt-1 text-xs text-muted">Add your first clinic location to get started.</div>
            <div className="mt-4">
              <Button leftIcon={<Plus size={14} />} onClick={() => setAddOpen(true)}>Add branch</Button>
            </div>
          </div>
        </Card>
      )}

      <AddBranchModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

// ─── Branch card ──────────────────────────────────────────────────────────

interface CardProps {
  branch: Branch;
  active: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onMakePrimary: () => void;
  canDelete: boolean;
}

function BranchCard({ branch, active, onActivate, onDelete, onMakePrimary, canDelete }: CardProps) {
  return (
    <Card className={cn('relative overflow-hidden transition-shadow', active && 'ring-2 ring-brand-500/50')}>
      {active && (
        <div className="absolute top-3 right-3">
          <Badge tone="brand" size="sm">
            <Check size={10} className="mr-0.5" /> Active
          </Badge>
        </div>
      )}
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
          <Building2 size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{branch.name}</div>
            {branch.primary && (
              <Star size={12} className="text-warning-500 shrink-0" aria-label="Primary branch" />
            )}
          </div>
          <div className="mt-0.5 text-[11px] text-muted flex items-start gap-1">
            <MapPin size={10} className="mt-0.5 shrink-0" />
            <span className="truncate">{branch.city}</span>
          </div>
          {branch.address && (
            <div className="mt-2 text-[11px] text-muted line-clamp-2">{branch.address}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t hairline flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {!branch.primary && (
            <button
              type="button"
              onClick={onMakePrimary}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-warning-600 dark:text-warning-500 hover:bg-warning-500/10 transition-colors"
              title="Set as primary"
            >
              <Star size={11} /> Make primary
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!active && (
            <Button size="sm" variant="outline" onClick={onActivate}>
              Switch
            </Button>
          )}
          {canDelete && !branch.primary && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-500/10 transition-colors"
              title="Delete branch"
              aria-label="Delete branch"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
