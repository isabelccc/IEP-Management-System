function QuickActions({onAddStudent, onAddIep}){

    return (
        // TODO: add container styles (gap/wrap) in CSS for responsive layout.
        <div className="quick-actions" type = "button">
        {/* TODO: add `type="button"` on each button to avoid accidental form submit behavior. */}
        <button className="add-student" onClick={onAddStudent}>Add Student</button>
        <button className="add-iep" onClick = {onAddIep}>Create IEP</button>
        </div>
    )


}

export default QuickActions;