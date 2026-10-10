import { Component } from '@angular/core';
import {HorizontalSection} from '../../../components/layouts/horizontal-section/horizontal-section';
import {ZoneSection} from '../../../components/layouts/zone-section/zone-section';
import {VerticalSection} from '../../../components/layouts/vertical-section/vertical-section';
import {Checkbox} from '../../../components/form/checkbox/checkbox';
import {DateField} from '../../../components/form/date/date';
import {FormField} from '../../../components/form/form-field/form-field';
import {InputField} from '../../../components/form/input/input';
import {Radio} from '../../../components/form/radio/radio';
import {Select} from '../../../components/form/select/select';
import {Textarea} from '../../../components/form/textarea/textarea';
import {Toggle} from '../../../components/form/toggle/toggle';
import {Sections} from '../../../components/sections/sections';

@Component({
  selector: 'app-user',
  imports: [VerticalSection, HorizontalSection, Sections, ZoneSection, Checkbox, DateField, FormField, InputField, Radio, Select, Textarea, Toggle],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {

}
