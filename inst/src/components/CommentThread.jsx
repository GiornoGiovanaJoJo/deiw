import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import CommentForm from "./CommentForm";

export default function CommentThread({
  entitaetTyp,
  entitaetId,
  allBenutzer = [],
}) {
  const [kommentare, setKommentare] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadComments();
    loadCurrentUser();
  }, [entitaetTyp, entitaetId]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error(error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const comments = await base44.entities.Kommentar.filter({
        entitaet_typ: entitaetTyp,
        entitaet_id: entitaetId,
      });
      setKommentare(comments.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Laden der Kommentare");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (kommentarId) => {
    if (!window.confirm("Kommentar löschen?")) return;

    try {
      await base44.entities.Kommentar.delete(kommentarId);
      setKommentare(kommentare.filter((k) => k.id !== kommentarId));
      toast.success("Kommentar gelöscht");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Löschen des Kommentars");
    }
  };

  const getReplies = (parentId) => {
    return kommentare.filter((k) => k.parent_kommentar_id === parentId);
  };

  const getTopLevelComments = () => {
    return kommentare.filter((k) => !k.parent_kommentar_id);
  };

  const highlightMentions = (text) => {
    return text.replace(/@(\w+\s\w+)/g, '<span class="font-semibold text-blue-600">@$1</span>');
  };

  const CommentItem = ({ kommentar, isReply = false }) => {
    const canDelete = currentUser?.email === kommentar.benutzer_id || currentUser?.role === "admin";

    return (
      <div className={`${isReply ? "ml-8 border-l-2 border-slate-200 pl-4" : ""}`}>
        <div className={`p-3 rounded-lg ${isReply ? "bg-slate-50" : "bg-white border border-slate-200"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-800 text-sm">{kommentar.benutzer_name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {format(new Date(kommentar.created_date), "dd.MM.yyyy HH:mm", {
                  locale: de,
                })}
              </p>
            </div>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-slate-400 hover:text-red-500"
                onClick={() => handleDeleteComment(kommentar.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p
            className="text-sm text-slate-700 mt-2 break-words"
            dangerouslySetInnerHTML={{ __html: highlightMentions(kommentar.inhalt) }}
          />

          {kommentar.mentions && kommentar.mentions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {kommentar.mentions.map((mention) => (
                <span key={mention.benutzer_id} className="inline-text-xs text-slate-500">
                  @{mention.benutzer_name}
                </span>
              ))}
            </div>
          )}

          {!isReply && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-slate-600 hover:text-slate-900 gap-1"
              onClick={() => setReplyingTo(kommentar.id)}
            >
              <Reply className="w-4 h-4" />
              Antwort
            </Button>
          )}
        </div>

        {replyingTo === kommentar.id && (
          <div className="mt-3 ml-8 p-3 bg-slate-50 rounded-lg">
            <CommentForm
              entitaetTyp={entitaetTyp}
              entitaetId={entitaetId}
              parentKommentarId={kommentar.id}
              allBenutzer={allBenutzer}
              onCommentAdded={() => {
                loadComments();
                setReplyingTo(null);
              }}
              onCancel={() => setReplyingTo(null)}
              placeholder="Antwort schreiben..."
            />
          </div>
        )}

        {getReplies(kommentar.id).map((reply) => (
          <div key={reply.id} className="mt-3">
            <CommentItem kommentar={reply} isReply={true} />
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-6 text-slate-400">Kommentare werden geladen...</div>;
  }

  const topLevelComments = getTopLevelComments();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-800">
          Diskussion ({kommentare.length})
        </h3>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <CommentForm
          entitaetTyp={entitaetTyp}
          entitaetId={entitaetId}
          allBenutzer={allBenutzer}
          onCommentAdded={loadComments}
        />
      </div>

      <div className="space-y-4">
        {topLevelComments.length > 0 ? (
          topLevelComments.map((kommentar) => (
            <CommentItem key={kommentar.id} kommentar={kommentar} />
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>Noch keine Kommentare</p>
          </div>
        )}
      </div>
    </div>
  );
}