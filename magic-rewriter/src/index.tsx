// ChatGPT Apps SDK UI — compliant starter.
import {
  Form,
  Field,
  TextArea,
  Select,
  Button,
  Card,
  Text,
  type FormContext,
  type FormValues,
  type SelectOption
} from "chatgpt-apps-ui";

async function runRewriteModel(input: string, tone: string): Promise<string> {
  // TODO(Apps SDK): Replace with official ai.run() call.
  // Preserve meaning, no new facts or URLs, keep input language.
  return "";
}

export default function App() {
  const toneOptions: SelectOption[] = [
    { label: "Professional", value: "Professional" },
    { label: "Clear", value: "Clear" },
    { label: "Friendly", value: "Friendly" }
  ];

  return (
    <Form
      aria-label="Magic Rewriter"
      onSubmit={async (values: FormValues, ctx: FormContext) => {
        const inputValue = values?.inputText;
        const toneValue = values?.tone;
        const input = typeof inputValue === "string" ? inputValue.trim() : "";
        const tone = typeof toneValue === "string" && toneValue ? toneValue : "Professional";
        if (!input) {
          ctx.setError("inputText", "Text is required");
          return;
        }
        ctx.setStatus("processing");
        try {
          const output = await runRewriteModel(input, tone);
          ctx.setValue("outputText", output || "");
          ctx.setStatus("idle");
        } catch {
          ctx.setFormError("An error occurred while rewriting.");
          ctx.setStatus("error");
        }
      }}
    >
      <Card>
        <Text role="heading" aria-level={1}>Magic Rewriter</Text>
        <Text size="sm">Rewrite any text—professional, clear, or friendly. No added facts.</Text>
      </Card>

      <Field name="tone" label="Tone" aria-label="Select rewriting tone" initialValue="Professional">
        <Select options={toneOptions} />
      </Field>

      <Field
        name="inputText"
        label="Source text"
        aria-label="Source text to rewrite"
        placeholder="Paste your text here…"
        required
      >
        <TextArea maxLength={3000} showCount />
      </Field>

      <Card>
        <Field name="outputText" label="Rewritten" aria-label="Rewritten result" readOnly>
          <TextArea readOnly />
        </Field>
      </Card>

      <Card>
        <Button type="submit" aria-label="Rewrite">Rewrite</Button>
        <Button
          type="button"
          aria-label="Regenerate"
          onClick={async (_: unknown, ctx: FormContext) => {
            const inputValue = ctx.getValue("inputText");
            const toneValue = ctx.getValue("tone");
            const input = typeof inputValue === "string" ? inputValue.trim() : "";
            const tone = typeof toneValue === "string" && toneValue ? toneValue : "Professional";
            if (!input) return;
            ctx.setStatus("processing");
            try {
              const output = await runRewriteModel(input, tone);
              ctx.setValue("outputText", output || "");
              ctx.setStatus("idle");
            } catch {
              ctx.setFormError("An error occurred while regenerating.");
              ctx.setStatus("error");
            }
          }}
        >
          Regenerate
        </Button>
        <Button
          type="button"
          aria-label="Copy"
          onClick={(_: unknown, ctx: FormContext) => {
            const textValue = ctx.getValue("outputText");
            const textToCopy = typeof textValue === "string" ? textValue : "";
            if (textToCopy) ctx.copyToClipboard(textToCopy);
          }}
        >
          Copy
        </Button>
        <Button
          type="button"
          aria-label="Clear"
          onClick={(_: unknown, ctx: FormContext) => {
            ctx.setValue("inputText", "");
            ctx.setValue("outputText", "");
          }}
        >
          Clear
        </Button>
      </Card>

      <Card>
        <Text size="xs" aria-live="polite">
          Notes: Preserves meaning, no added facts or URLs. Output stays in the input language.
        </Text>
      </Card>
    </Form>
  );
}
