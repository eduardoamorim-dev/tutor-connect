import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Star, Loader2 } from "lucide-react";

function RateModal({ open, onClose, onSubmit }) {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(nota, comentario);
      setNota(5);
      setComentario("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setNota(5);
      setComentario("");
    }
    onClose(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar Sessao</DialogTitle>
          <DialogDescription>Como foi sua experiencia?</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Nota</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setNota(n)}
                  className={`p-2 ${nota >= n ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star
                    className={`w-8 h-8 ${nota >= n ? "fill-current" : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Comentario (opcional)</Label>
            <Textarea
              placeholder="Conte como foi sua experiencia..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-violet-600"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RateModal;
