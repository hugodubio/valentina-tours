interface Props {
  title: string;
  action?: React.ReactNode;
  configAction?: React.ReactNode;
}

export default function Header({ title, action, configAction }: Props) {
  return (
    <div className="flex items-center justify-between mb-6 md:mb-8">
      <h2 className="text-lg md:text-xl font-semibold text-ink dark:text-[#e8e5e0]">{title}</h2>
      <div className="flex items-center gap-2">
        {configAction}
        {action}
      </div>
    </div>
  );
}
