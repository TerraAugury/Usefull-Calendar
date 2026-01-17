import * as Dialog from '@radix-ui/react-dialog'
import { IconClose } from './Icons'

const EMOJI_GROUPS = [
  {
    label: 'Schedule',
    emojis: [
      '\u{1F5D3}\uFE0F',
      '\u23F0',
      '\u{1F4CC}',
      '\u2705',
      '\u{1F552}',
      '\u{1F4DD}',
      '\u{1F4C5}',
    ],
  },
  {
    label: 'Health',
    emojis: ['\u{1F3E5}', '\u{1F48A}', '\u{1FA7A}', '\u{1F9D8}', '\u{1F9B7}', '\u{1F9E0}'],
  },
  {
    label: 'Home',
    emojis: ['\u{1F3E0}', '\u{1F9F9}', '\u{1F527}', '\u{1FAB4}', '\u{1F9FA}', '\u{1F9EF}'],
  },
  {
    label: 'People',
    emojis: [
      '\u{1F465}',
      '\u2764\uFE0F',
      '\u{1F389}',
      '\u2615\uFE0F',
      '\u{1F91D}',
      '\u{1F476}',
      '\u{1F381}',
    ],
  },
  {
    label: 'Work',
    emojis: [
      '\u{1F4BC}',
      '\u{1F4DA}',
      '\u{1F9E0}',
      '\u{1F9FE}',
      '\u{1F5A5}\uFE0F',
      '\u{1F4C8}',
      '\u{1F5C2}\uFE0F',
    ],
  },
  {
    label: 'Travel',
    emojis: ['\u2708\uFE0F', '\u{1F4CD}', '\u{1F697}', '\u{1F9F3}', '\u{1F686}', '\u{1F3E8}'],
  },
  {
    label: 'Money',
    emojis: ['\u{1F4B3}', '\u{1F9FE}', '\u{1F3E6}', '\u{1F4B0}', '\u{1F9EE}'],
  },
  {
    label: 'Labels',
    emojis: ['\u{1F3F7}\uFE0F', '\u2B50', '\u{1F514}', '\u{1F4CE}', '\u{1F4E3}', '\u{1FA84}'],
  },
]

export default function EmojiPickerDialog({ open, onOpenChange, onSelect }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Choose an icon</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label="Close icon picker">
                <IconClose className="tab-icon" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Select an emoji icon to represent this category.
          </Dialog.Description>
          <div className="dialog-body">
            {EMOJI_GROUPS.map((group, groupIndex) => (
              <div key={group.label} className="emoji-group">
                <p className="form-label">{group.label}</p>
                <div className="emoji-grid">
                  {group.emojis.map((emoji, emojiIndex) => (
                    <button
                      key={`${group.label}-${emoji}`}
                      type="button"
                      className="emoji-button"
                      onClick={() => onSelect(emoji)}
                      aria-label={`Select ${emoji}`}
                      autoFocus={groupIndex === 0 && emojiIndex === 0}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
