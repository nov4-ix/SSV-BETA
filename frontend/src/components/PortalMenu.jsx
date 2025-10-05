export default function PortalMenu({ onSelect=()=>{} }) {
  const items = [
    {key:"ghost", label:"GHOST STUDIO"},
    {key:"codex", label:"CODEX"},
    {key:"clone", label:"CLONE STATION"},
    {key:"liga",  label:"LA LIGA"},
    {key:"alvae", label:"ALVAE"},
    {key:"res",   label:"RESISTENCIA"},
  ];
  return (
    <div className="portal-layer">
      <div className="portal-circle"></div>
      <div className="menu-grid">
        {items.map((it)=>(
          <button key={it.key} className="menu-chip" onClick={()=>onSelect(it.key)}>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
