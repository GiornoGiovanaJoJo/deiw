import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import { toast } from "sonner";

export default function CommentForm({
  entitaetTyp,
  entitaetId,
  parentKommentarId = null,
  allBenutzer = [],
  onCommentAdded,
  onCancel,
  placeholder = "Kommentar schreiben...",
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);
    setCursorPos(e.target.selectionStart);

    // Check for @ mention
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      if (afterAt && !afterAt.includes(" ")) {
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (benutzer) => {
    const lastAtIndex = text.lastIndexOf("@");
    const beforeAt = text.substring(0, lastAtIndex);
    const afterAt = text.substring(text.indexOf("@") + 1);
    const afterFirstSpace = afterAt.split(" ").slice(1).join(" ");

    const newText = `${beforeAt}@${benutzer.vorname} ${benutzer.nachname} ${afterFirstSpace}`;
    setText(newText);
    setShowMentions(false);

    if (!mentions.some((m) => m.benutzer_id === benutzer.id)) {
      setMentions([...mentions, { benutzer_id: benutzer.id, benutzer_name: `${benutzer.vorname} ${benutzer.nachname}` }]);
    }
  };

  const getMentionSuggestions = () => {
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex === -1) return [];

    const afterAt = text.substring(lastAtIndex + 1);
    const searchTerm = afterAt.split(" ")[0].toLowerCase();

    return allBenutzer.filter(
      (b) =>
        searchTerm &&
        (b.vorname.toLowerCase().includes(searchTerm) ||
          b.nachname.toLowerCase().includes(searchTerm))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await base44.entities.Kommentar.create({
        entitaet_typ: entitaetTyp,
        entitaet_id: entitaetId,
        parent_kommentar_id: parentKommentarId,
        inhalt: text,
        benutzer_id: (await base44.auth.me()).email,
        benutzer_name: (await base44.auth.me()).full_name,
        mentions: mentions,
      });

      setText("");
      setMentions([]);
      toast.success("Kommentar hinzugefügt");
      onCommentAdded?.();
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Hinzufügen des Kommentars");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = getMentionSuggestions();

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={parentKommentarId ? 2 : 3}
          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
        />

        {showMentions && suggestions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            {suggestions.slice(0, 5).map((benutzer) => (
              <button
                key={benutzer.id}
                type="button"
                onClick={() => handleMentionSelect(benutzer)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="font-medium">@{benutzer.vorname}</span>
                <span className="text-slate-500"> {benutzer.nachname}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mentions.map((mention) => (
            <div
              key={mention.benutzer_id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700"
            >
              <span>@{mention.benutzer_name}</span>
              <button
                type="button"
                onClick={() =>
                  setMentions(mentions.filter((m) => m.benutzer_id !== mention.benutzer_id))
                }
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Abbrechen
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || !text.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? "Wird gesendet..." : "Senden"}
        </Button>
      </div>
    </form>
  );
}