interface InfoCardProps {
  label: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

export function InfoCard({ label, children, onEdit }: InfoCardProps) {
  return (
    <div className="bg-white p-6 rounded-4xl border border-black/5 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] uppercase font-black tracking-widest text-black/20">
          {label}
        </h4>
        {onEdit && (
          <button onClick={onEdit} className="text-[9px] font-black border-b border-black">
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

