import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

export const CardsMoveAnimations = [
    trigger('cardTrigger', [
        state('inactive', style({
        })),
        state('active', style({
            top: '0',
            left: '0'
        })),
        transition('inactive => active', animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
];
