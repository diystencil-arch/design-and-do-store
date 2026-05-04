// Upcoming festival/holiday banner
const FESTIVALS: { name: string; date: string; emoji: string }[] = [
  { name: "Valentine's Day", date: '02-14', emoji: '💝' },
  { name: 'Easter', date: '04-05', emoji: '🐰' },
  { name: "Mother's Day", date: '05-10', emoji: '🌸' },
  { name: "Father's Day", date: '06-21', emoji: '👔' },
  { name: 'Canada Day', date: '07-01', emoji: '🍁' },
  { name: 'Halloween', date: '10-31', emoji: '🎃' },
  { name: 'Thanksgiving', date: '10-13', emoji: '🍂' },
  { name: 'Christmas', date: '12-25', emoji: '🎄' },
  { name: 'New Year', date: '01-01', emoji: '✨' },
];

function nextFestival() {
  const today = new Date();
  const y = today.getFullYear();
  const todayStr = today.toISOString().slice(5, 10);
  const upcoming = FESTIVALS
    .map((f) => {
      const inThisYear = f.date >= todayStr;
      const date = new Date(`${inThisYear ? y : y + 1}-${f.date}`);
      const days = Math.ceil((date.getTime() - today.getTime()) / 86400000);
      return { ...f, days };
    })
    .sort((a, b) => a.days - b.days)[0];
  return upcoming;
}

export default function FestivalBanner() {
  const f = nextFestival();
  if (!f || f.days > 60) return null;
  const label = f.days <= 0 ? `Happy ${f.name}!` : `${f.name} is in ${f.days} day${f.days === 1 ? '' : 's'} — shop early!`;
  return (
    <div className="bg-primary text-primary-foreground text-xs sm:text-sm text-center py-2 px-3">
      <span className="mr-2">{f.emoji}</span>{label}
    </div>
  );
}
