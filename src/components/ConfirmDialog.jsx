import * as Dialog from '@radix-ui/react-dialog'
import { IconClose } from './Icons'

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive = false,
}) {
  const descriptionText = description ?? 'Confirm this action.'
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label="Close dialog">
                <IconClose className="tab-icon" />
              </button>
            </Dialog.Close>
          </div>
          <div className="dialog-body">
            <Dialog.Description
              className={description ? 'dialog-description' : 'sr-only'}
            >
              {descriptionText}
            </Dialog.Description>
          </div>
          <div className="dialog-footer button-row">
            <button
              className={`btn ${destructive ? 'btn-destructive' : 'btn-primary'}`}
              type="button"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
            <Dialog.Close asChild>
              <button className="btn btn-secondary" type="button">
                Cancel
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
