import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';

import ForgotPassword from '../../pages/ForgotPassword';

const apiMock = new MockAdapter(api);

const mockedAddToast = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('../../context/ToastContext', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    mockedAddToast.mockClear();
  });

  it('should be able request password reset', async () => {
    apiMock.onPost('/password/forgot').replyOnce(204);

    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Recuperar');

    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
    });
  });

  it('should not be able to request password reset with invalid e-mail', async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Recuperar');

    fireEvent.change(emailField, { target: { value: 'wrong-email-data' } });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).not.toHaveBeenCalled();
    });
  });

  it('should show an error message if password reset request fails', async () => {
    apiMock.onPost('/password/forgot').reply(404);

    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const buttonElement = getByText('Recuperar');

    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });

    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
    });
  });
});
