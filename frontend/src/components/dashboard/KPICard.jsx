function KPISection({
    cards
  }) {
   
  
    return (
      <div className="kpi-section">
        {cards.map((c, index) => (
          <div key={c.label} className="kpi-card" >
            <h3 className="kpi-value">{c.value}</h3>
            
            <button className="kpi-label" onClick={c.onClick}>{c.label}</button>

          </div>
        ))}
      </div>
    );
  }
  
  export default KPISection;