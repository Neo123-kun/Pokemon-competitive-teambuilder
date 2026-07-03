import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useItemList } from "../hooks/usePokemon";

const BASE = "https://pokeapi.co/api/v2";

function useItemDetail(itemName) {
  return useQuery({
    queryKey: ["item-detail", itemName],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/item/${itemName}`);
      return data;
    },
    enabled: !!itemName,
    staleTime: Infinity,
  });
}

function ItemIcon({ itemName, size = "md" }) {
  const { data } = useItemDetail(itemName);
  const sprite = data?.sprites?.default;
  const px = size === "sm" ? "w-6 h-6" : "w-10 h-10";

  if (!sprite)
    return (
      <div
        className={`${px} bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs`}
      >
        ?
      </div>
    );
  return <img src={sprite} alt={itemName} className={`${px} object-contain`} />;
}

function ItemPreviewPanel({ itemName }) {
  const { data, isLoading } = useItemDetail(itemName);

  if (!itemName)
    return (
      <div className="flex items-center justify-center h-full min-h-40">
        <p className="text-gray-600 text-sm text-center">
          Hover an item
          <br />
          to preview it
        </p>
      </div>
    );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full min-h-40">
        <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
      </div>
    );

  if (!data) return null;

  const sprite = data.sprites?.default;
  const effect = data.effect_entries?.find((e) => e.language.name === "en");
  const shortEffect = effect?.short_effect ?? "";
  const longEffect = effect?.effect ?? "";
  const category = data.category?.name?.replace(/-/g, " ") ?? "";
  const flavorText =
    data.flavor_text_entries
      ?.find((e) => e.language.name === "en")
      ?.text?.replace(/\n/g, " ") ?? "";

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        {sprite ? (
          <img
            src={sprite}
            alt={itemName}
            className="w-12 h-12 object-contain"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
            ?
          </div>
        )}
        <div>
          <h3 className="text-white font-bold capitalize">
            {itemName.replace(/-/g, " ")}
          </h3>
          {category && (
            <span className="text-xs text-gray-400 capitalize bg-gray-700 px-2 py-0.5 rounded-full">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Effect */}
      {shortEffect && (
        <div className="bg-gray-900 rounded-xl p-3">
          <p className="text-gray-300 text-xs leading-relaxed">{shortEffect}</p>
        </div>
      )}

      {/* Flavor text */}
      {flavorText && (
        <p className="text-gray-500 text-xs leading-relaxed italic">
          "{flavorText}"
        </p>
      )}
    </div>
  );
}

export default function ItemSelector({ selectedItem, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const { data: allItems = [], isLoading } = useItemList();

  const filtered = useMemo(
    () =>
      allItems.filter((i) => i.includes(search.toLowerCase())).slice(191, 304),
    [search, allItems],
  );

  function handleSelect(item) {
    onChange(item);
    setOpen(false);
    setSearch("");
    setHoveredItem(null);
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Held Item</h3>
        {selectedItem && (
          <button
            onClick={() => onChange(null)}
            className="text-red-400 text-xs hover:text-red-300"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* Selected item display */}
      {selectedItem ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ItemIcon itemName={selectedItem} size="md" />
            <p className="text-yellow-400 font-semibold capitalize">
              {selectedItem.replace(/-/g, " ")}
            </p>
          </div>
          <button
            onClick={() => {
              setOpen(!open);
              setHoveredItem(null);
            }}
            className="text-gray-400 text-xs hover:text-white"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setOpen(!open);
            setHoveredItem(null);
          }}
          className="text-yellow-400 text-sm hover:underline text-left"
        >
          + Select item
        </button>
      )}

      {/* Picker — side by side */}
      {open && (
        <div className="mt-1 border-t border-gray-700 pt-3 grid grid-cols-2 gap-3">
          {/* Left — searchable list */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isLoading ? "Loading items..." : "Search items..."}
              disabled={isLoading}
              autoFocus
              className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition-colors"
            />
            <ul className="max-h-64 overflow-y-auto flex flex-col gap-0.5">
              {filtered.map((item) => (
                <li
                  key={item}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${
                      hoveredItem === item
                        ? "bg-gray-600 text-white"
                        : selectedItem === item
                          ? "bg-yellow-400/20 text-yellow-400"
                          : "text-gray-300 hover:bg-gray-700"
                    }`}
                >
                  <ItemIcon itemName={item} size="sm" />
                  <span className="text-sm capitalize">
                    {item.replace(/-/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — preview panel */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 min-h-40 overflow-y-auto">
            <ItemPreviewPanel itemName={hoveredItem ?? selectedItem} />
          </div>
        </div>
      )}
    </div>
  );
}
