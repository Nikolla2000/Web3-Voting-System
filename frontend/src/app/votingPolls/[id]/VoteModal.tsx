'use client'

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function VoteModal({show, setShow} : {show: boolean, setShow: any}) {
  const handleClose = () => {
    console.log("Closing modal");
    setShow(false);
  }

  console.log("Modal show state:", show);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header> 
        <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}