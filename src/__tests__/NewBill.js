/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Store from "../__mocks__/store.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should not accepte invalid type file", () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const inputFile = screen.getByTestId('file')
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      inputFile.addEventListener('change', handleChangeFile)
      // crée un objet de fichier fictif qui simule le chargement d'un fichier invalide de type texte
      const invalidFile = new File(["invalid content"], "invalid-file.txt", {
        type: "text/plain",
      });
      fireEvent.change(inputFile, { target: { files: [invalidFile] } });
      // expect expressions
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0].type).not.toMatch(/image\/(jpeg|jpg|png)/)
    })
    test('Then I put a correct file, it should store it', () =>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = Store
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const inputFile = screen.getByTestId('file')
      const validFile = new File(["valid content"], "valid-file.jpg", {
        type: "image/jpg",
      });
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [validFile] } });
      expect(newBill.billId).not.toBe('null')
      expect(newBill.fileUrl).not.toBe('null')
      expect(newBill.fileName).not.toBe('null')
    })

   test('Then I fill in all the fields, handleSubmit should work correctly', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = Store
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const inputFile = screen.getByTestId('file')
      const validFile = new File(["valid content"], "valid-file.jpg", {
        type: "image/jpg",
      });
      const type = screen.getByTestId('expense-type')
      const name = screen.getByTestId('expense-name')
      const amount = screen.getByTestId('amount')
      const datepicker = screen.getByTestId('datepicker')
      const vat = screen.getByTestId('vat')
      const pct = screen.getByTestId('pct')
      const commentary = screen.getByTestId('commentary')

      fireEvent.change(inputFile, { target: { files: [validFile] } });
      fireEvent.change(type, { target: { value: "Hôtel et logement" } });
      fireEvent.change(name, { target: { value: "encore" } });
      fireEvent.change(amount, { target: { value: 400 } });
      fireEvent.change(datepicker, { target: { value: "2004-04-04" } });
      fireEvent.change(vat, { target: { value: "80" } });
      fireEvent.change(pct, { target: { value: 20 } });
      fireEvent.change(commentary, { target: { value: "séminaire billed" } });

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const form = screen.getByTestId('form-new-bill');
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled()
   })
  })
})
