import { autoSave } from '../../utils/workbookStorage';

describe('Auto-save Service', () => {
  it('should debounce multiple save calls', async () => {
    const saveSpy = jest.fn();
    
    // Mock the save function
    global.fetch = saveSpy;
    
    // Trigger multiple saves
    autoSave.save('session1', { data: '1' });
    autoSave.save('session1', { data: '2' });
    autoSave.save('session1', { data: '3' });
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(
      '/api/workbook/session1/save',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"data":"3"')
      }
    );
  });
});


