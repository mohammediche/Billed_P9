/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Store from "../__mocks__/store.js"
import router from "../app/Router.js";
import { expectedBills } from "../fixtures/expectedBills.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('Then it should navigate to NewBill page when "New Bill" button is clicked', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
    
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
    
      router();
      window.onNavigate(ROUTES_PATH.Bills);
    
      const bill = new Bills({
        document, onNavigate, store: Store, localStorage: window.localStorage
      });
    
      const onNavigateSpy = jest.spyOn(bill, 'onNavigate');
    
      const buttonNewBill = screen.getByTestId('btn-new-bill');
      fireEvent.click(buttonNewBill);
    
      expect(onNavigateSpy).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
    test('Then should handle corrupted data in formatDate function', async () => {
      const corruptedBill = {
        "id": "invalidBillId",
        "vat": "20",
        "fileUrl": "https://test.storage.tld/invalid-bill.jpg",
        "status": "pending",
        "type": "Invalid Type",
        "commentary": "corrupted data",
        "name": "invalid bill",
        "fileName": "invalid-bill.jpg",
        "date": "Invalid Date Format",
        "amount": 100,
        "commentAdmin": "corruption",
        "email": "a@a",
        "pct": 20
      };

      const mockedBills = {
        list() {
          return Promise.resolve([...bills, corruptedBill]);
        },
        create: jest.fn(),
        update: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      router();
      window.onNavigate(ROUTES_PATH.Bills);

      const bill = new Bills({
        document, onNavigate, store: { bills: () => mockedBills }, localStorage: window.localStorage
      });

      const listBills = await bill.getBills();

      const foundCorruptedBill = listBills.find((bill) => bill.id === corruptedBill.id);

      expect(foundCorruptedBill).toBeDefined();
    });
    test("Then fetches bills from mock API GET", async () => {
      const mockedBills = {
        list: jest.fn(() => Promise.resolve(bills)),
        create: jest.fn(),
        update: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      router();
      window.onNavigate(ROUTES_PATH.Bills);

      const bill = new Bills({
        document, onNavigate, store: { bills: () => mockedBills }, localStorage: window.localStorage
      });

      const listBills = await bill.getBills();

      expect(mockedBills.list).toHaveBeenCalledTimes(1);
      expect(listBills).toEqual(expectedBills);
    });

  })
})
