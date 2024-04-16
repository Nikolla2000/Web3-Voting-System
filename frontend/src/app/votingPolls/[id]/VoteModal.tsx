import { ChosenOption, Poll } from '@/app/_types/types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import "./modal.css"
import { VoteButton } from '@/app/ui/votingPolls/VoteButton';

export default function VoteModal({show, setShow, poll, chosenOption} 
  : {show: boolean, setShow: any, poll: Poll, chosenOption: ChosenOption}) {
  console.log(poll)
  
  const handleClose = () => {
    setShow(false);
  }

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
              {`Vote for ${
                chosenOption == ChosenOption.First ? poll.optionOneName : poll.optionTwoName}
              `}         
            </Modal.Title>
        </Modal.Header> 
        <Modal.Body>
          <img src={chosenOption == ChosenOption.First ? poll.img1URL : poll.img2URL} alt='Option Image'/>
          <p className='my-4 text-xl text-center'>You are about to vote for <span>{chosenOption == ChosenOption.First ? poll.optionOneName : poll.optionTwoName}</span> in the poll of <span>{poll.optionOneName} vs {poll.optionTwoName}</span>.</p>
          <p className='text-center text-xl font-bold'>Confirm your vote?</p>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={handleClose}>
            Close
          </Button> */}
          {/* <Button variant="primary" onClick={handleClose}>
            {`Vote for ${chosenOption == ChosenOption.First ? poll.optionOneName : poll.optionTwoName}`}
          </Button> */}
          <VoteButton chosenOption={chosenOption} poll={poll}/>
        </Modal.Footer>
      </Modal>
    </>
  );
}