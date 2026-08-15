import CodeBlock from "../components/CodeBlock.jsx";

const TEMPLATE = `**Describe the bug**
A clear description.

**To reproduce**
1. Go to ...
2. Hover ...
3. See ...

**Expected**
What you expected to happen.

**Environment**
- Browser:
- OS:
- Screen size:`;

export default function Support() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Support</h2>
      <p className="max-w-2xl text-white/70">
        Found a bug or have a feature idea? Open an issue on the repository.
      </p>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="font-medium text-white">Issue template</div>
        <div className="mt-3">
          <CodeBlock code={TEMPLATE} language="markdown" />
        </div>
      </div>
    </div>
  );
}
