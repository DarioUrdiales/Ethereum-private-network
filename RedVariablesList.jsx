// Component for the toggle list of variables
export function RedVariablesList({ red, isOpen, handleRedInputChange }) {
  return (
    <div className={`collapse ${isOpen ? "show" : ""}`}>
      <ul className="list-group">
        {/* ...other list items... */}
        <li className="list-group-item">
          <strong>Total Red Count:</strong> {redSpecifications.length}
        </li>
      </ul>
    </div>
  );
}
