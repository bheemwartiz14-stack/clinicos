"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  createTemplateAction,
  updateTemplateAction,
  deleteTemplateAction,
  type TemplateActionState,
} from "../actions/notification-template.actions";
import type { NotificationTemplateRecord } from "../services/notification-template.service";
import { FormField, SelectField } from "@/components/form-controls";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const channelLabels: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  system: "System",
};

const initialState: TemplateActionState = { ok: false };

export function TemplatesListView({
  templates,
}: {
  templates: NotificationTemplateRecord[];
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Notification Templates</h1>
          <p className="text-sm text-muted-foreground">
            Manage email, SMS, WhatsApp, and system notification templates.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/notifications/templates/create">
            <Plus className="h-4 w-4" aria-hidden />
            Add Template
          </Link>
        </Button>
      </div>
      <Card className="rounded-lg">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Template</th>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Channel</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {templates.map((template) => (
                <tr key={template.id} className="transition hover:bg-muted/35">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{template.name}</div>
                    {template.subject ? (
                      <div className="text-xs text-muted-foreground">{template.subject}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono">
                      {template.code}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{channelLabels[template.channel] ?? template.channel}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={template.isActive ? "default" : "outline"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/settings/notifications/templates/${template.id}/edit`}>
                          <Edit className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                      <form action={deleteTemplateAction}>
                        <input type="hidden" name="id" value={template.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {templates.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No templates found. Create your first notification template.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function TemplateForm({
  template,
}: {
  template?: NotificationTemplateRecord | null;
}) {
  const router = useRouter();
  const action = template
    ? updateTemplateAction.bind(null, template.id)
    : createTemplateAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const bodyRef = useRef<HTMLInputElement>(null);
  const [bodyHtml, setBodyHtml] = useState<string>(
    template?.body
      ? template.body.replace(/\n/g, "<br>")
      : "",
  );

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message ?? "Saved successfully");
      router.push("/settings/notifications/templates");
      router.refresh();
    } else if (state.message && !state.ok) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          {template ? "Edit Template" : "Add Template"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {template
            ? "Update notification template content and settings."
            : "Create a new notification template."}
        </p>
      </div>
      {state.errors?.name || state.errors?.code || state.errors?.body ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {Object.entries(state.errors).map(([key, msg]) => (
            <p key={key}>{key}: {msg}</p>
          ))}
        </div>
      ) : null}
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Use {'{{variable_name}}'} placeholders for dynamic content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={formAction}
            className="grid gap-4 md:grid-cols-2"
          >
            <FormField
              label="Template name"
              name="name"
              defaultValue={template?.name ?? ""}
              error={state.errors?.name}
              required
            />
            <FormField
              label="Code"
              name="code"
              defaultValue={template?.code ?? ""}
              hint="Unique identifier (e.g., welcome_email)"
              error={state.errors?.code}
              required
            />
            <SelectField
              label="Channel"
              name="channel"
              defaultValue={template?.channel ?? "email"}
              options={[
                { value: "email", label: "Email" },
                { value: "sms", label: "SMS" },
                { value: "whatsapp", label: "WhatsApp" },
                { value: "system", label: "System" },
              ]}
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={template?.isActive ?? true}
                  className="h-4 w-4 rounded border-border text-primary accent-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="font-medium text-foreground">Active</span>
              </label>
            </div>
            <FormField
              label="Subject"
              name="subject"
              defaultValue={template?.subject ?? ""}
              className="md:col-span-2"
              hint="Email subject line (only for email channel)"
            />
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">
                Body <span className="text-destructive">*</span>
              </label>
              <RichTextEditor
                value={bodyHtml}
                onChange={(html) => {
                  setBodyHtml(html);
                  const div = document.createElement("div");
                  div.innerHTML = html;
                  if (bodyRef.current) bodyRef.current.value = div.innerText;
                }}
                placeholder={`Hello {{patient_name}},\n\nYour appointment is confirmed for {{appointment_date}} at {{appointment_time}}.\n\nThank you,\n{{clinic_name}}`}
              />
              <p className="text-xs text-muted-foreground">
                Use {'{{variable_name}}'} placeholders for dynamic content.
              </p>
              <input
                ref={bodyRef}
                type="hidden"
                name="body"
                defaultValue={template?.body ?? ""}
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : template ? "Save Changes" : "Create Template"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/settings/notifications/templates">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
