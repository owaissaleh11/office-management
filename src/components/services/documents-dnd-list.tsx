"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServiceFormValues } from "@/lib/validations/service";
import { useEffect, useState } from "react";

export function DocumentsDndList() {
  const { control, register } = useFormContext<ServiceFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "documents",
  });

  // Hydration fix for dnd
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
    
    // We don't strictly need to update displayOrder here because it can be 
    // inferred by array index on submission, but it's good practice.
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">المستندات المطلوبة</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ title: "", displayOrder: fields.length })}
          className="h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          إضافة مستند
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="documents-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 rounded-md border bg-card p-2 shadow-sm transition-colors ${
                        snapshot.isDragging ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab hover:text-primary active:cursor-grabbing p-1"
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground w-6 text-center">
                          {index + 1}.
                        </span>
                        <Input
                          {...register(`documents.${index}.title` as const)}
                          placeholder="اسم المستند (مثال: صورة الجواز)"
                          className="h-9"
                        />
                        <input
                          type="hidden"
                          {...register(`documents.${index}.displayOrder` as const)}
                          value={index}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {fields.length === 0 && (
                <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                  لا توجد مستندات مضافة. انقر على إضافة مستند للبدء.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
