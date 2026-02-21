import { LayoutGrid, List } from 'lucide-react';

function StudentsToolbar({ filter, onFilterChange, view, onToggleView, onAddStudent }) {
  return (
    <div className="students-toolbar">
      <div className="students-actions">
        <button className="students-add-btn" type="button" onClick={onAddStudent}>
          Add Student
        </button>
        <select className="students-filter" value={filter} onChange={onFilterChange}>
          <option value="">All Students</option>
          <option value="5">Grade 5</option>
          <option value="6">Grade 6</option>
          <option value="7">Grade 7</option>
          <option value="8">Grade 8</option>
          <option value="9">Grade 9</option>
          <option value="10">Grade 10</option>
          <option value="11">Grade 11</option>
          <option value="12">Grade 12</option>
        </select>
      </div>
      <div className="students-view-toggle">
        <button type="button" onClick={onToggleView}>
          {view === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
        </button>
      </div>
    </div>
  );
}

export default StudentsToolbar;
