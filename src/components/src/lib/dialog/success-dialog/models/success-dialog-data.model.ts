import { StandardDialogData } from '../../standard-dialog/model/standard-dialog-data.model';

export interface SuccessDialogData<PayloadTypes extends any[] = any[]>
  extends Required<Pick<StandardDialogData<PayloadTypes>, 'actions'>> {
  imageUrl: string;
  imageAltTextTranslationKey?: string;
  headerTranslationKey: string;
  textTranslationKey?: string;
}
