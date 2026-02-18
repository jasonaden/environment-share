---
name: form-builder
description: >
  Picnic Form + FormField + all input types (TextInput, Select, MultiSelect,
  SearchableSelect, Checkbox, RadioGroup, Switch, DatePicker, TextArea, etc.).
  Use when building forms with validation, Formik state, or standalone inputs.
triggers:
  - build a form
  - input fields
  - form validation
  - formik
---

# Building Validated Forms

Form + FormField + input types. `import { Form, useForm, FormField } from '@attentive/picnic'`

## When to Use

- **Form**: Formik-managed form with validation — use `Form.*` sub-components
- **Standalone inputs**: Simple controlled inputs outside Formik — use components directly (same API minus `name` prop)

## Formik Auto-Connection Rule

All `Form.*` sub-components auto-connect to Formik context via the `name` prop. `Form.TextInput name="email"` binds to `values.email`, `errors.email`, `touched.email` automatically. This applies to every `Form.*` input listed below — no additional Formik wiring needed.

## Form Setup

props: `!initialValues(V)` `!onSubmit(fn)` `validationSchema(Yup.Schema)` `validate(fn)` `enableReinitialize(boolean)`

Hook: `useForm<V>()` — access Formik context (values, errors, touched, setFieldValue, resetForm, isSubmitting, dirty).

## Form Compound Hierarchy

```
Form !initialValues !onSubmit validationSchema?
  Form.FormField layout(vertical*|horizontal)
    Form.Label requirement(none*|required|optional)
    Form.HelperText                       renders Text variant="caption"
    Form.ErrorText name(string)           renders Text variant="caption" $textCritical
    Form.IconPopover                      renders IconPopover at $size6
    [Form input component]
  Form.SubmitButton                       auto-disables during isSubmitting
  Form.ResetButton                        resets to initialValues
```

## Input Type Decision Guide

| Need | Component | Non-obvious |
|------|-----------|-------------|
| Single-line text | TextInput | `size(small\|normal*)` `state(normal*\|error)` |
| Multi-line text | TextArea | `maxLength` shows character counter |
| Single select | Select | Sub: `.Item` `.IconItem` `.ThirdPartyIconItem` `.Group` `.Value` |
| Multi select | MultiSelect | Sub: `.Item` `.Group` — renders tags for selections |
| Searchable select | SearchableSelect | `onInputValueChange` separate from `onChange` |
| Boolean toggle | Switch | `checked` / `onCheckedChange` |
| Multi-choice | Checkbox | `checked: boolean \| 'indeterminate'` supports indeterminate |
| Single choice | RadioGroup | Sub: `.Item(!value)` — `orientation(horizontal\|vertical*)` |
| Date | DatePicker | Moment.js objects. `isOutsideRange(fn)` disables dates |
| Date range | DateRangePicker | `startDate` + `endDate` (Moment), `onDatesChange({startDate, endDate})` |
| Time | TimePicker | `value` in HH:mm format |
| File upload | FileInput | `accept(string)` `multiple(boolean)` |
| Grouped inputs | InputGroup | Shared borders — e.g., country code + phone number |
| Tag creation | TagSelector | `tags(string[])` `onAddTag(fn)` `onRemoveTag(fn)` |

## Select Variants

**Select** — single value, Sub: `.Item` `.IconItem` `.ThirdPartyIconItem` `.Group` `.Value`
- `align(start*|end)` dropdown alignment
- `selectedLines(one-line*|multi-line)` truncation
- `.Group` takes `!label(string)` for group headings
- `.Value` for custom selected display

**MultiSelect** — multiple values rendered as tags, Sub: `.Item` `.Group`

**SearchableSelect** — single value with search filter, Sub: `.Item` `.Group`
- `onInputValueChange` fires on type; `onChange` fires on selection

## FormField Layout

Organizes label + input + helpers. Parses children by type into slots.

props: `layout(vertical*|horizontal)`

Sub: `.Label` `.HelperText` `.ErrorText` `.IconPopover`

| Sub | Non-obvious |
|-----|-------------|
| .Label | `requirement(none*\|required\|optional)` — required=red asterisk, optional="(optional)" text |
| .HelperText | Renders `Text variant="caption"` |
| .ErrorText | Renders `Text variant="caption"` with `$textCritical` color |
| .IconPopover | Renders IconPopover sized to `$size6` |

## Validation Patterns

- **Schema**: `validationSchema={Yup.object({ field: Yup.string().required('Required') })}`
- **Custom**: `validate={(values) => ({ field: values.field ? undefined : 'Required' })}`
- **Per-field errors**: `<Form.ErrorText name="fieldName" />` auto-displays from Formik

## Canonical Example

```tsx
<Form
  initialValues={{ email: '', role: '', bio: '', notifications: false }}
  validationSchema={Yup.object({
    email: Yup.string().email('Invalid email').required('Required'),
    role: Yup.string().required('Select a role'),
  })}
  onSubmit={handleSubmit}
>
  <Stack spacing="$space4">
    <Form.FormField>
      <Form.Label requirement="required">Email</Form.Label>
      <Form.TextInput name="email" />
      <Form.ErrorText name="email" />
    </Form.FormField>

    <Form.FormField>
      <Form.Label requirement="required">Role</Form.Label>
      <Form.Select name="role">
        <Form.Select.Group label="Engineering">
          <Form.Select.IconItem value="frontend" iconName="Code">Frontend</Form.Select.IconItem>
          <Form.Select.IconItem value="backend" iconName="Server">Backend</Form.Select.IconItem>
        </Form.Select.Group>
        <Form.Select.Group label="Design">
          <Form.Select.Item value="ux">UX Designer</Form.Select.Item>
        </Form.Select.Group>
      </Form.Select>
      <Form.ErrorText name="role" />
    </Form.FormField>

    <Form.FormField>
      <Form.Label>Bio</Form.Label>
      <Form.TextArea name="bio" maxLength={500} />
      <Form.HelperText>Brief description of your role</Form.HelperText>
    </Form.FormField>

    <Form.FormField layout="horizontal">
      <Form.Switch name="notifications" />
      <Form.Label>Enable notifications</Form.Label>
    </Form.FormField>

    <Form.SubmitButton>Create User</Form.SubmitButton>
  </Stack>
</Form>
```

## Standalone Usage

Same API as `Form.*` minus the `name` prop. Use standard `value`/`onChange` controlled pattern. Wrap in `FormField` (not `Form.FormField`) for consistent label/error layout.

## Common Mistakes Checklist

- `name` prop MUST match keys in `initialValues` — mismatches silently fail
- `Form.*` components MUST be inside a `<Form>` — they read Formik context
- Use `enableReinitialize` when `initialValues` change after mount (e.g., edit forms)
- Never mix `Form.*` and standalone inputs in the same form
- `SearchableSelect.onInputValueChange` is for the search string; `onChange` is for the selected value — don't confuse them
