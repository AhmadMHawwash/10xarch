"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';

export interface Note {
  id: number;
  content: string;
}

const Notes = ({
  notes,
  setNotes,
}: {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
}) => {
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now(), content: newNote }]);
      setNewNote('');
    }
  };

  const updateNote = (id: number, content: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, content } : note
    ));
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="p-1">
      <div className="mb-4">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full mb-2"
          placeholder="Add a new note"
          rows={3}
        />
        <Button variant="secondary" size="sm" onClick={addNote}>Add Note</Button>
      </div>
      <ScrollArea className="h-[calc(100vh-300px)]">
        {notes.map(note => (
          <div key={note.id} className="mb-4 p-2 border rounded">
            <Textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, e.target.value)}
              className="w-full mb-2"
              rows={3}
            />
            <Button variant="destructive" onClick={() => deleteNote(note.id)}>Delete</Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default Notes;