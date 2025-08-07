import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { assignLanes } from "./assignLanes.js";
import timelineItems from "./timelineItems.js";

// Utility function to calculate the difference in days between two dates
function daysBetween(a, b) {
  return (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24);
}

function App() {
  const [items, setItems] = useState(timelineItems);
  const [editing, setEditing] = useState(null); // {id, value, left, top}

  const lanes = assignLanes(items);

  useEffect(() => {
    console.log(lanes);
  }, []);

  // Seaching for the minimum date to align the timeline
  const minDate = items.reduce(
    (min, item) => (item.start < min ? item.start : min),
    items[0].start
  );

  // Define how many pixels represent one day in the timeline
  const pxPerDay = 16;

  function handleSave() {
    setItems((prev) =>
      prev.map((item) =>
        item.id === editing.id ? { ...item, name: editing.value } : item
      )
    );
    setEditing(null);
  }

  function handleCancel() {
    setEditing(null);
  }

  return (
    <div className="p-8 flex flex-col items-center gap-4">
      <header className="flex flex-col items-center gap-2">
        <h2>Timeline proporcional</h2>
        <h3>{items.length} timeline items to render</h3>
      </header>
      <section className="flex flex-col gap-4 w-full">
        {lanes.map((lane, idx) => (
          <div key={idx} className="grid grid-cols-[200px_1fr] items-center">
            <div className="font-bold border-l-2 pl-2 text-right pr-2 flex items-center">
              Lane {idx + 1}
            </div>
            <div className="relative h-24 w-full">
              {lane.map((item, itemIdx) => {
                const offset = daysBetween(minDate, item.start) * pxPerDay;
                const width =
                  (daysBetween(item.start, item.end) + 1) * pxPerDay;
                const isEditing = editing && editing.id === item.id;
                return (
                  <div
                    key={itemIdx}
                    className={`${
                      isEditing && "!min-w-[250px] !min-h-40 scale-110"
                    } absolute hover:!min-w-[250px] hover:!min-h-40 hover:!z-10 top-2 bg-blue-100 border border-blue-400 rounded px-2 py-1 text-sm overflow-hidden transition-transform duration-200 hover:scale-110 hover:z-10 shadow hover:shadow-lg cursor-pointer`}
                    style={{
                      left: `${offset}px`,
                      width: `${width}px`,
                      minWidth: "80px",
                      zIndex: isEditing ? 20 : 1,
                    }}
                    onClick={(e) => {
                      if (!isEditing) {
                        // Get the position of the card to position the buttons
                        const rect = e.currentTarget.getBoundingClientRect();
                        setEditing({
                          id: item.id,
                          value: item.name,
                          left: rect.right,
                          top: rect.top + window.scrollY,
                        });
                      }
                    }}
                  >
                    {isEditing ? (
                      <>
                        <input
                          className="w-full bg-white border border-blue-400 rounded px-1 py-0.5 text-sm"
                          value={editing.value}
                          autoFocus
                          onChange={(e) =>
                            setEditing((ed) => ({
                              ...ed,
                              value: e.target.value,
                            }))
                          }
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") handleCancel();
                          }}
                        />
                        <br />
                        <span className="text-xs text-gray-500">
                          ({item.start} - {item.end})
                        </span>
                      </>
                    ) : (
                      <>
                        {item.name}
                        <br />
                        <span className="text-xs text-gray-500">
                          ({item.start} - {item.end})
                        </span>
                      </>
                    )}
                  </div>
                );
              })}

              {editing && (
                <div
                  className="fixed flex flex-col gap-2"
                  style={{
                    left: editing.left + 12,
                    top: editing.top,
                    zIndex: 50,
                  }}
                >
                  <button
                    className="bg-red-500 text-white rounded w-8 h-8 flex items-center justify-center text-xl border-2 border-red-500 hover:bg-white hover:text-red-500 transition"
                    title="Cancelar"
                    onClick={handleCancel}
                  >
                    ✕
                  </button>
                  <button
                    className="bg-green-500 text-white rounded w-8 h-8 flex items-center justify-center text-xl border-2 border-green-500 hover:bg-white hover:text-green-500 transition"
                    title="Salvar"
                    onClick={handleSave}
                  >
                    ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
