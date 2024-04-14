import { Button, TextInput, Select, Textarea, Container, Group } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

interface Field {
  id: string;
  label: string;
  placeholder: string;
  control_type: 'input' | 'select' | 'datepicker' | 'textarea' | 'button';
  control_kind: string;
  state?: 'required' | 'disabled';
  value?: string;
  value_selection_kind?: string;
  value_selection_url?: string | undefined;
  options?: { label: string; value: string }[]; 
  children?: Field[];
}

type FormValues = {
  [key: string]: string;
};

export const DataForm: React.FC = () => {
  const [formData, setFormData] = useState<Field[]>([]);
  const [formValues, setFormValues] = useState<FormValues>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/v1/new');
        const data = response.data.view.children[0].children[0].children as Field[];
        setFormData(data);

        const initialValues: FormValues = {};
        const fetchPromises: Promise<unknown>[] = [];

        data.forEach((field) => {
          initialValues[field.id] = field.value || '';

          if (field.control_type === 'select' && field.value_selection_kind === 'fetch' && field.value_selection_url) {
            fetchPromises.push(
              axios.get(field.value_selection_url)
                .then(res => {
                    field.options = Object.entries(res.data).map(([key, value]) => ({
                        label: value as string,
                        value: key
                    }));
                })
            );
          }
        });

        await Promise.all(fetchPromises);
        setFormValues(initialValues);
      } catch (error) {
        console.error('Ошибка при запросе данных:', error);
      }
    };

    fetchData();
  }, []);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: formValues,
    validate: (values) => {
      const errors: Partial<FormValues> = {};

      if (values.email && !values.email.includes('@')) {
        errors.email = 'Неправильная почта';
      }
      return errors;
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      const response = await axios.post('/api/v1/send', values);
      console.log('Форма отправлена:', response.data);
      notifications.show({
        title: 'Успех!',
        message: 'Форма успешно отправлена!',
        color: 'green'
      });
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Что то пошло не так',
      });
    }
    navigate('/');
  };

  const handleCancel = async () => {
    try {
      await axios.delete('/api/v1/rollback');
      console.log('Отправка формы отменена');
    } catch (error) {
      console.error('Ошибка при отмене заполнения формы:', error);
    }
    navigate('/');
  };

  const renderInput = (field: Field) => {
    switch (field.control_type) {
      case 'input':
        return (
          <TextInput
            label={field.label}
            placeholder={field.placeholder}
            {...form.getInputProps(field.id)}
            type={field.control_kind}
            required={field.state === 'required'}
            disabled={field.state === 'disabled'}
          />
        );
      case 'select':
        return (
          <Select
            label={field.label}
            placeholder={field.placeholder}
            data={field.options || []}
            {...form.getInputProps(field.id)}
            required={field.state === 'required'}
          />
        );
      case 'datepicker':
        return (
          <DateTimePicker
            placeholder={field.placeholder}
            required={field.state === 'required'}
            label={field.label}
            valueFormat="DD MMM YYYY"
            {...form.getInputProps(field.id)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            label={field.label}
            placeholder={field.placeholder}
            {...form.getInputProps(field.id)}
            required={field.state === 'required'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container size="sm">
      <form onSubmit={form.onSubmit(formValues => {
        handleSubmit(formValues);
        form.reset();
      })}>
        {formData.map(field => (
          <div key={field.id}>
            {renderInput(field)}
          </div>
        ))}
        <Group mt="md">
          <Button type="submit" color="blue">Отправить</Button>
          <Button type="button" color="red" onClick={handleCancel}>Отмена</Button>
        </Group>
      </form>
    </Container>
  );
};
