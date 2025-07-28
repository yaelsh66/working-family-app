import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";

function PublicHomePage() {

  
  return (
    <Container className="py-5">
      <header className="text-center mb-5">
        <h1 className="display-4">Working Family App</h1>
        <p className="lead" style={{ fontSize: '40px' }}>Kids earn sceen time by doing household chores</p>
        <Button as={Link} to="/signup" variant="primary" size='lg'>
          Get Started
        </Button>
      </header>
      <header className="text-center mb-5">
        <h1 className="display-4" style={{ textDecoration: 'underline', fontSize: '50px' }}>How does it work?</h1>
        <p className="lead" style={{ textAlign: 'left', fontSize: '40px' }}>1. The family signs in with separate accounts for parents and kids.</p>
        <Image src="/../../../public/Image1.jpeg" thumbnail  
        style={{ width: '250px', height: 'auto' }}
        />
        <p className="lead" style={{ textAlign: 'left', fontSize: '40px' }}>2. Parents and kids suggest chores with associated screen time rewards.</p>
        <Image src="/../../../public/Image2.jpeg" thumbnail  
        style={{ width: '250px', height: 'auto' }}
        />
        <p className="lead" style={{ textAlign: 'left', fontSize: '40px' }}>3. Kids complete the chores and submit them for parental approval.</p>
        <Image src="/../../../public/Image3.jpeg" thumbnail  
        style={{ width: '250px', height: 'auto' }}
        />
        <p className="lead" style={{ textAlign: 'left', fontSize: '40px' }}>4. Once approved, the earned screen time is added to the kid’s account.</p>
        <Image src="/../../../public/Image4.PNG" thumbnail  
        style={{ width: '250px', height: 'auto' }}
        />
        <p className="lead" style={{ textAlign: 'left', fontSize: '40px' }}>5. When screen time is used, parents or kids update the remaining balance.</p>
        <Image src="/../../../public/Image5.jpeg" thumbnail  
        style={{ width: '250px', height: 'auto' }}
        />
      </header>
    
    {/*  <Row xs={1} md={3} className="g-4">
        <Col>
          <Card className="h-100 text-center shadow-sm">
            <Card.Img
              variant="top"
              src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-chores-household-flaticons-lineal-color-flat-icons.png"
              alt="Create & Assign Chores"
              style={{ width: "64px", margin: "1rem auto 0" }}
            />
            <Card.Body>
              <Card.Title>Create & Assign New Chores & Allowances</Card.Title>
              <Card.Text>
                Easily add chores and assign allowances to your family members.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 text-center shadow-sm">
            <Card.Img
              variant="top"
              src="https://img.icons8.com/external-justicon-flat-justicon/64/000000/external-edit-user-interface-justicon-flat-justicon.png"
              alt="Change chore price"
              style={{ width: "64px", margin: "1rem auto 0" }}
            />
            <Card.Body>
              <Card.Title>Change Chore Prices & Notify Kids</Card.Title>
              <Card.Text>
                Adjust chore prices anytime and send WhatsApp notifications instantly.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 text-center shadow-sm">
            <Card.Img
              variant="top"
              src="https://img.icons8.com/external-flat-icons-inmotus-design/64/000000/external-whatsapp-social-media-flat-icons-inmotus-design.png"
              alt="Notify parents"
              style={{ width: "64px", margin: "1rem auto 0" }}
            />
            <Card.Body>
              <Card.Title>Notify Parents When Chores Are Done</Card.Title>
              <Card.Text>
                Kids can notify parents via WhatsApp when chores are completed.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      */}
    </Container>
  );
}

export default PublicHomePage;
