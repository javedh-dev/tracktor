import { superForm, defaults } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { vehicleStore } from '$stores/vehicle.svelte';
import type { z } from 'zod';

export function createSheetForm(config: {
  schema: z.ZodObject<any, any>;
  onUpdated?: (event: { form: any }) => void;
  validationMethod?: 'onsubmit' | 'oninput' | 'onblur';
}) {
  let processing = $state(false);
  let attachment = $state<File>();
  let removeExistingAttachment = $state(false);

  const form = superForm(defaults(zod4(config.schema)), {
    validators: zod4(config.schema),
    SPA: true,
    resetForm: false,
    validationMethod: config.validationMethod || 'onsubmit',
    onUpdated: config.onUpdated as any
  });

  const { form: formData, enhance } = form;

  function setVehicleId() {
    formData.update((fd: any) => ({
      ...fd,
      vehicleId: vehicleStore.selectedId || ''
    }));
  }

  function resetAttachment() {
    attachment = undefined;
    removeExistingAttachment = false;
  }

  return {
    get processing() {
      return processing;
    },
    set processing(v) {
      processing = v;
    },
    get attachment() {
      return attachment;
    },
    set attachment(v) {
      attachment = v;
    },
    get removeExistingAttachment() {
      return removeExistingAttachment;
    },
    set removeExistingAttachment(v) {
      removeExistingAttachment = v;
    },
    form,
    formData,
    enhance,
    setVehicleId,
    resetAttachment
  };
}
