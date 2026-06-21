"use client";

import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { RadioGroup } from "@/components/ui/Radio";
import { Button } from "@/components/ui/Button";
import { UploadZone } from "@/components/ui/UploadZone";

export interface FormFieldSchema {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "password"
    | "email"
    | "select"
    | "checkbox"
    | "switch"
    | "radio"
    | "file"
    | "image";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
  validation?: z.ZodTypeAny;
}

export interface DynamicFormSchema {
  fields: FormFieldSchema[];
}

interface DynamicFormProps {
  schema: DynamicFormSchema;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  submitLabel?: string;
}

export function DynamicForm({
  schema,
  onSubmit,
  submitLabel = "Submit",
}: DynamicFormProps) {
  // 1. Build validation schema dynamically based on fields definition
  const shape: Record<string, z.ZodTypeAny> = {};
  const defaultValues: Record<string, unknown> = {};

  schema.fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny = z.any();

    if (field.validation) {
      fieldSchema = field.validation;
    } else {
      switch (field.type) {
        case "email":
          fieldSchema = z.string().email(field.required ? "Invalid email" : undefined);
          if (!field.required) fieldSchema = fieldSchema.optional().or(z.literal(""));
          break;
        case "number":
          fieldSchema = z.number();
          if (!field.required) fieldSchema = fieldSchema.optional();
          break;
        case "checkbox":
        case "switch":
          fieldSchema = z.boolean();
          break;
        case "file":
        case "image":
          fieldSchema = z.array(z.string());
          if (!field.required) fieldSchema = fieldSchema.optional();
          break;
        default:
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
          } else {
            fieldSchema = fieldSchema.optional().or(z.literal(""));
          }
      }
    }

    shape[field.name] = fieldSchema;
    defaultValues[field.name] =
      field.defaultValue !== undefined
        ? field.defaultValue
        : field.type === "checkbox" || field.type === "switch"
        ? false
        : field.type === "file" || field.type === "image"
        ? []
        : "";
  });

  const validationSchema = z.object(shape);

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {schema.fields.map((field) => {
          return (
            <div key={field.name} className="w-full">
              <Controller
                name={field.name}
                control={control}
                render={({ field: controllerField }) => {
                  const errorMsg = errors[field.name]?.message as string | undefined;

                  switch (field.type) {
                    case "textarea":
                      return (
                        <TextArea
                          {...controllerField}
                          value={(controllerField.value as string) || ""}
                          label={field.label}
                          placeholder={field.placeholder}
                          error={errorMsg}
                        />
                      );
                    case "select":
                      return (
                        <Select
                          {...controllerField}
                          value={(controllerField.value as string) || ""}
                          label={field.label}
                          placeholder={field.placeholder}
                          options={field.options || []}
                          error={errorMsg}
                          onChange={(val) => controllerField.onChange(val)}
                        />
                      );
                    case "checkbox":
                      return (
                        <Checkbox
                          {...controllerField}
                          value={controllerField.value !== undefined ? String(controllerField.value) : ""}
                          label={field.label}
                          isSelected={!!controllerField.value}
                          onChange={controllerField.onChange}
                          error={errorMsg}
                        />
                      );
                    case "switch":
                      return (
                        <Switch
                          {...controllerField}
                          value={controllerField.value !== undefined ? String(controllerField.value) : ""}
                          label={field.label}
                          isSelected={!!controllerField.value}
                          onChange={controllerField.onChange}
                          error={errorMsg}
                        />
                      );
                    case "radio":
                      return (
                        <RadioGroup
                          {...controllerField}
                          value={(controllerField.value as string) || ""}
                          options={field.options || []}
                          error={errorMsg}
                          onChange={(val: string) => controllerField.onChange(val)}
                        />
                      );
                    case "file":
                    case "image":
                      return (
                        <div className="space-y-2">
                          <label className="text-foreground font-semibold text-sm">
                            {field.label}
                          </label>
                          <UploadZone
                            accept={field.type === "image" ? "image/*" : "*"}
                            onUploadComplete={(urls) => controllerField.onChange(urls)}
                          />
                          {errorMsg && (
                            <p className="text-tiny text-danger font-medium mt-1">
                              {errorMsg}
                            </p>
                          )}
                        </div>
                      );
                    case "number":
                      return (
                        <Input
                          {...controllerField}
                          value={controllerField.value !== undefined ? String(controllerField.value) : ""}
                          type="number"
                          label={field.label}
                          placeholder={field.placeholder}
                          error={errorMsg}
                          onChange={(e) =>
                            controllerField.onChange(
                              e.target.value === "" ? "" : Number(e.target.value)
                            )
                          }
                        />
                      );
                    default:
                      return (
                        <Input
                          {...controllerField}
                          value={(controllerField.value as string) || ""}
                          type={field.type}
                          label={field.label}
                          placeholder={field.placeholder}
                          error={errorMsg}
                        />
                      );
                  }
                }}
              />
            </div>
          );
        })}

        <Button type="submit" loading={isSubmitting} className="w-full">
          {submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}
