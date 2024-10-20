import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ClientAdd = () => {
  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    dogName: Yup.string().required('Required'),
  });

  return (
    <Formik
      initialValues={{ name: '', dogName: '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {() => (
        <Form>
          <label htmlFor="name">Client Name</label>
          <Field name="name" type="text" />
          <ErrorMessage name="name" component="div" />
          
          <label htmlFor="dogName">Dog Name</label>
          <Field name="dogName" type="text" />
          <ErrorMessage name="dogName" component="div" />

          <button type="submit">Add Client</button>
        </Form>
      )}
    </Formik>
  );
};

export default ClientAdd;
